import { Component, signal } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { Header } from './components/layout/header/header';
import { Cart } from './components/cart/cart';
import { ChatWidgetComponent } from "./components/chat-widget/chat-widget";

import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Cart, ChatWidgetComponent, ToastModule, ConfirmDialogModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('ChineseAuction');
}
