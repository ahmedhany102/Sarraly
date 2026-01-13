import React from 'react';
import { Card } from '@/components/ui/card';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

interface ContactInfoProps {
  settings: any;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ settings }) => {
  const phone = settings?.phone || '01501640040';
  const email = settings?.email || 'support@sarraly.com';
  const address = settings?.address || 'القاهرة، مصر';

  return (
    <Card className="p-6 shadow-lg bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl">
      <h2 className="text-xl font-bold mb-6 text-right">تواصل معنا</h2>

      <div className="space-y-5">
        {/* Phone */}
        <div className="flex items-center gap-4 flex-row-reverse">
          <div className="bg-white/20 p-3 rounded-full">
            <Phone className="h-6 w-6" />
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">اتصل بنا</p>
            <a
              href={`tel:${phone}`}
              className="text-lg font-semibold hover:text-white/80 transition-colors"
              dir="ltr"
            >
              {phone}
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-4 flex-row-reverse">
          <div className="bg-white/20 p-3 rounded-full">
            <Mail className="h-6 w-6" />
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">البريد الإلكتروني</p>
            <a
              href={`mailto:${email}`}
              className="text-lg font-semibold hover:text-white/80 transition-colors"
            >
              {email}
            </a>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-4 flex-row-reverse">
          <div className="bg-white/20 p-3 rounded-full">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">الموقع</p>
            <p className="text-lg font-semibold">{address}</p>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="pt-4 border-t border-white/20">
          <a
            href="https://wa.me/201501640040"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 transition-colors rounded-xl py-3 px-4"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">تواصل عبر واتساب</span>
          </a>
        </div>
      </div>
    </Card>
  );
};

export default ContactInfo;
