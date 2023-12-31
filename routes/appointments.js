const express = require('express');
const pool = require('../database');
const router = express.Router();



// POST endpoint to check if an appointment slot is available
router.post('/api/appointments/check-availability', async (req, res) => {
  const { employee_id, service_id, appointment_date, duration } = req.body;

  try {
    const available = await isTimeSlotAvailable(employee_id, service_id, appointment_date, duration);
    res.json({ available });
  } catch (err) {
    console.error('Error checking appointment availability:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/appointments/availability', async (req, res) => {
  const { service_id, user_id, desired_date } = req.query;
  
  try {

    const serviceResult = await pool.query('SELECT duration FROM services.services WHERE service_id = $1', [service_id]);
    const serviceDuration = serviceResult.rows[0].duration;

    const timeSlots = calculateTimeSlots(desired_date, 45);

    const employeeResult = await pool.query('SELECT employee_id FROM employees WHERE user_id = $1', [user_id]);
    const employee_id = employeeResult.rows[0].employee_id;
    

    const appointments = await getAppointmentsForEmployee(employee_id, desired_date);

    console.log(employee_id);

    const availableSlots = getAvailableSlots(timeSlots, appointments, serviceDuration);

    res.json(availableSlots);
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a list of all appointments
router.get('/api/appointments', async (req, res) => {
  try {
    // Fetch all appointments
    const appointmentsResult = await pool.query('SELECT * FROM appointments.appointments');
    const appointments = appointmentsResult.rows;

    // Fetch all customers
    const customersResult = await pool.query('SELECT customer_id, last_name, first_name FROM customers');
    const customers = customersResult.rows;

    // Fetch all employees
    const employeesResult = await pool.query('SELECT employee_id, last_name, first_name FROM employees');
    const employees = employeesResult.rows;

    // Fetch all services
    const servicesResult = await pool.query('SELECT service_id, name FROM services.services');
    const services = servicesResult.rows;

    // Map over appointments and append customer, employee, and service information
    const updatedAppointments = appointments.map((appointment) => {
      const customer = customers.find(c => c.customer_id === appointment.customer_id);
      const employee = employees.find(e => e.employee_id === appointment.employee_id);
      const service = services.find(s => s.service_id === appointment.service_id);

      // Return the appointment with additional details
      return {
        ...appointment,
        customerName: customer ? `${customer.first_name} ${customer.last_name}` : null,
        employeeName: employee ? `${employee.first_name} ${employee.last_name}` : null,
        serviceName: service ? service.name : null,
      };
    });

    res.json(updatedAppointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/appointments/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const customerResult = await pool.query('SELECT customer_id FROM customers WHERE user_id = $1', [id]);
    const employeeResult = await pool.query('SELECT employee_id FROM employees WHERE user_id = $1', [id]);

    const now = new Date();

    if (customerResult.rowCount === 0) {
      
      const appointmentsResult = await pool.query('SELECT * FROM appointments.appointments WHERE employee_id = $1',[employeeResult.rows[0].employee_id]);
      
      appointments = appointmentsResult.rows;
      

    }
    else {

      const appointmentsResult = await pool.query('SELECT * FROM appointments.appointments WHERE customer_id = $1',[customerResult.rows[0].customer_id]);
      appointments = appointmentsResult.rows;
    }

    const customersResult = await pool.query('SELECT customer_id, last_name, first_name FROM customers');
    const customers = customersResult.rows;

    const employeesResult = await pool.query('SELECT employee_id, last_name, first_name FROM employees');
    const employees = employeesResult.rows;

    const servicesResult = await pool.query('SELECT service_id, name FROM services.services');
    const services = servicesResult.rows;

    const updatedAppointments = appointments.map((appointment) => {
      const customer = customers.find(c => c.customer_id === appointment.customer_id);
      const employee = employees.find(e => e.employee_id === appointment.employee_id);
      const service = services.find(s => s.service_id === appointment.service_id);

      return {
        ...appointment,
        customerName: customer ? `${customer.first_name} ${customer.last_name}` : null,
        employeeName: employee ? `${employee.first_name} ${employee.last_name}` : null,
        serviceName: service ? service.name : null,
      };
    });

    res.json(updatedAppointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: err.message });
  }
});


// Get a single appointment by ID
router.get('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await pool.query('SELECT * FROM appointments.appointments WHERE appointment_id = $1', [id]);
    if (appointment.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new appointment
router.post('/api/appointments', async (req, res) => {
  const { service_id, appointment_date, duration, reminderEmail,reminderSms, reminderTimeFrame} = req.body;
  const customer_user_id = req.body.customer_id; 
  const employee_user_id = req.body.employee_id;

  try {
    await pool.query('BEGIN');

    const customerResult = await pool.query('SELECT customer_id FROM customers WHERE user_id = $1', [customer_user_id]);
    if (customerResult.rowCount === 0) {
      throw new Error('Customer not found');
    }
    const customer_id = customerResult.rows[0].customer_id;

    const employeeResult = await pool.query('SELECT employee_id FROM employees WHERE user_id = $1', [employee_user_id]);
    if (employeeResult.rowCount === 0) {
      throw new Error('Employee not found');
    }
    const employee_id = employeeResult.rows[0].employee_id;

    const insertQuery = `
      INSERT INTO appointments.appointments (customer_id, service_id, employee_id, appointment_date, duration, reminder_email,reminder_sms,reminder_timeframe, reminder_sent)
      VALUES ($1, $2, $3, $4, $5,$6,$7,$8,$9)
      RETURNING *;
    `;
    const insertResult = await pool.query(insertQuery, [customer_id, service_id, employee_id, appointment_date, duration, reminderEmail,reminderSms, reminderTimeFrame,true]);

    await pool.query('COMMIT');

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update an existing appointment
router.put('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { customer_id, service_id, employee_id, appointment_date, duration } = req.body;
  try {
    const updatedAppointment = await pool.query(
      'UPDATE appointments.appointments SET customer_id = $1, service_id = $2, employee_id = $3, appointment_date = $4, duration = $5 WHERE appointment_id = $6 RETURNING *',
      [customer_id, service_id, employee_id, appointment_date, duration, id]
    );
    if (updatedAppointment.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(updatedAppointment.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an appointment
router.delete('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM appointments.appointments WHERE appointment_id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


function calculateTimeSlots(desiredDate, duration) {
  const startOfDay = new Date(desiredDate);
  startOfDay.setHours(9, 0, 0, 0); 

  const endOfDay = new Date(desiredDate);
  endOfDay.setHours(17, 0, 0, 0);

  let slots = [];
  let currentTime = new Date(startOfDay);

  while (currentTime < endOfDay) {
    slots.push(new Date(currentTime));
    currentTime.setMinutes(currentTime.getMinutes() + duration);
  }

  return slots;
}

async function getAppointmentsForEmployee(employeeId, desiredDate) {
  const startOfDay = new Date(desiredDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(desiredDate);
  endOfDay.setHours(23, 59, 59, 999);

  const query = `
    SELECT * FROM appointments.appointments
    WHERE employee_id = $1
    AND appointment_date BETWEEN $2 AND $3;
  `;
  
  const { rows } = await pool.query(query, [employeeId, startOfDay, endOfDay]);

  return rows;
}

function getAvailableSlots(timeSlots, appointments, duration) {
  duration = parseInt(duration, 10);

  return timeSlots.filter(slot => {
    const slotStart = new Date(slot);
    const slotEnd = new Date(slotStart.getTime() + duration * 60000);

    const isSlotAvailable = !appointments.some(appointment => {
      const appointmentStart = new Date(appointment.appointment_date);
      const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);

      return slotStart < appointmentEnd && slotEnd > appointmentStart;
    });

    return isSlotAvailable;
  });
}

async function isTimeSlotAvailable(employeeId, serviceId, appointmentDate, duration) {
  const appointmentStart = new Date(appointmentDate);
  const appointmentEnd = new Date(appointmentStart.getTime() + duration * 60000);

  const query = `
    SELECT COUNT(*) FROM appointments.appointments
    WHERE employee_id = $1
    AND (
      (appointment_date BETWEEN $2 AND $3)
      OR (appointment_date + (duration * interval '1 minute') BETWEEN $2 AND $3)
      OR (appointment_date < $2 AND appointment_date + (duration * interval '1 minute') > $3)
    )
  `;

  const { rows } = await pool.query(query, [employeeId, appointmentStart, appointmentEnd]);
  return rows[0].count === '0';
}





module.exports = router;
