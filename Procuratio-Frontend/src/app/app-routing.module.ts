import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './products/products.component';
import { ServicesComponent } from './products/services.component';
import { AddProductComponent } from './add-product/add-product.component';
import { AddServiceComponent } from './add-service/add-service.component';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { AvailabilitySearchComponent } from './availability-search/availability-search.component';
import { SalesReceiptComponent } from './sales-receipt/sales-receipt.component';
import { CustomerFileComponent } from './customer-file/customer-file.component';
import { CampaignFormComponent } from './campaign-form/campaign-form.component';
import { AuthGuard } from './guards/auth.guard';



const routes: Routes = [
  { path: '', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: ShoppingCartComponent },
  { path: 'product/add', component: AddProductComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'service/add', component: AddServiceComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'receipt', component: SalesReceiptComponent },
  { path: 'appointment', component: AppointmentCalendarComponent },
  { path: 'appointment/create', component: AppointmentFormComponent },
  { path: 'appointment/availability', component: AvailabilitySearchComponent },
  { path: 'customer-file', component: CustomerFileComponent },
  { path: 'campaign', component: CampaignFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { 
  
  
}
