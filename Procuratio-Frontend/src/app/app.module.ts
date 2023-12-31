import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductsComponent } from './products/products.component';
import { ServicesComponent } from './products/services.component';
import { HttpClientModule } from '@angular/common/http';
import { AddProductComponent } from './add-product/add-product.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { EditProductDialogComponent } from './edit-product-dialog/edit-product-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule} from '@angular/material/menu';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EditServiceDialogComponent } from './edit-service-dialog/edit-service-dialog.component';
import { AddServiceComponent } from './add-service/add-service.component';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { SalesReceiptComponent } from './sales-receipt/sales-receipt.component';
import { AddItemComponent } from './add-item/add-item.component';
import { ReceiptListComponent } from './sales-receipt-list/sales-receipt-list.component';
import { ReceiptDetailComponent } from './receipt-detail/receipt-detail.component';
import { ReceiptItemComponent } from './receipt-item/receipt-item.component';
import { TotalSummaryComponent } from './total-summary/total-summary.component';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { AvailabilitySearchComponent } from './availability-search/availability-search.component';
import { AppointmentDialogComponent } from './appointment-dialog/appointment-dialog.component';
import { CampaignFormComponent } from './campaign-form/campaign-form.component';
import { CustomerFileComponent } from './customer-file/customer-file.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';



@NgModule({
  declarations: [
    AppComponent,
    ProductsComponent,
    ServicesComponent,
    AddProductComponent,
    EditProductDialogComponent,
    EditServiceDialogComponent,
    AddServiceComponent,
    ShoppingCartComponent,
    CheckoutComponent,
    RegisterComponent,
    LoginComponent,
    AddItemComponent,
    SalesReceiptComponent,
    ReceiptDetailComponent,
    ReceiptItemComponent,
    TotalSummaryComponent,
    ReceiptListComponent,
    AppointmentCalendarComponent,
    AppointmentFormComponent,
    AvailabilitySearchComponent,
    AppointmentDialogComponent,
    CampaignFormComponent,
    CustomerFileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FullCalendarModule,
    MatDialogModule,
    MatAutocompleteModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
