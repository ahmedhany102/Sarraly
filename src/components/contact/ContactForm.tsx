
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ContactFormProps {
  form: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
  isSubmitting: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({
  form,
  isSubmitting,
  onFormChange,
  onSubmit
}) => {
  return (
    <Card className="p-6 shadow-lg rounded-2xl">
      <h2 className="text-xl font-bold mb-6 text-right">أرسل لنا رسالة</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2 text-right">
            الاسم
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={onFormChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-right"
            placeholder="الاسم الكامل"
            required
          />
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2 text-right">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={onFormChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
            placeholder="example@email.com"
            dir="ltr"
            required
          />
        </div>

        {/* Subject field */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2 text-right">
            الموضوع
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={form.subject}
            onChange={onFormChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-right"
            placeholder="موضوع الرسالة"
            required
          />
        </div>

        {/* Message field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2 text-right">
            الرسالة
          </label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={onFormChange}
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-right resize-none"
            placeholder="اكتب رسالتك هنا..."
            required
          ></textarea>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all text-lg"
          size="lg"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري الإرسال...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send className="h-5 w-5" />
              إرسال الرسالة
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default ContactForm;
