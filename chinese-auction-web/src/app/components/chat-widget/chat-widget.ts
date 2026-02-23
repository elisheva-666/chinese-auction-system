import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true, // הוספתי את זה ליתר ביטחון אם את בגרסה חדשה
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.scss',
})
export class ChatWidgetComponent {
  private http = inject(HttpClient);
  
  isOpen = false;
  userMessage = '';
  isLoading = false;
  
  messages: Message[] = [
    { sender: 'bot', text: 'היי, אני אלישבע העוזרת האישית שלך 🤖. תרצה לשאול אותי שאלה?' }
  ];

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    // מניעת שליחה אם הטקסט ריק או אם יש כבר שליחה בתהליך
    if (!this.userMessage.trim() || this.isLoading) return;

    // 1. שמירת ההודעה והוספה למסך
    const msg = this.userMessage;
    this.messages.push({ sender: 'user', text: msg });
    
    // ניקוי ונעילה
    this.userMessage = '';
    this.isLoading = true;

    // 2. שלח לשרת (פעם אחת בלבד!)
    this.http.post<any>('https://localhost:7006/api/Ai/ask', { userMessage: msg })
      .subscribe({
        next: (res) => {
          this.messages.push({ sender: 'bot', text: res.botReply });
          this.isLoading = false;
          this.scrollToBottom();
        },
        error: (err) => {
          console.error(err);
          this.messages.push({ sender: 'bot', text: 'אופס, אלישבע התעייפה קצת... נסה שוב עוד רגע 😅' });
          this.isLoading = false;
          this.scrollToBottom();
        }
      });
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatBody = document.querySelector('.chat-body');
      if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
    }, 100);
  }
}