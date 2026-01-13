import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, CreditCard, Banknote, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    toast.success('Thanks for subscribing!');
    setEmail('');
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Column 1: Brand Info */}
          <div className="text-right">
            <Link to="/" className="inline-block mb-4">
              <img
                src="/logo.png"
                alt="Sarraly Logo"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              منصة سرعلي - بوابتك لعالم التجارة الإلكترونية المتكامل.
              <br />
              ابدأ، بع، وانمُ بلا حدود.
            </p>
            <div className="flex gap-3 justify-end">
              <a
                href="https://www.facebook.com/share/16LEN8zQG3/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/a7med0xd/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="text-right">
            <h3 className="font-bold text-gray-900 text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  الصفحة الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/section/best-seller-1" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  الأفضل مبيعاً
                </Link>
              </li>
              <li>
                <Link to="/vendors" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  المتاجر
                </Link>
              </li>
              <li>
                <Link to="/become-vendor" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  امتلك متجرك
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="text-right">
            <h3 className="font-bold text-gray-900 text-lg mb-4">خدمة العملاء</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link to="/policy/shipping" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  سياسة الشحن
                </Link>
              </li>
              <li>
                <Link to="/policy/returns" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  الاسترجاع والاستبدال
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="text-right">
            <h3 className="font-bold text-gray-900 text-lg mb-4">النشرة البريدية</h3>
            <p className="text-gray-600 text-sm mb-4">
              اشترك للحصول على أحدث العروض والخصومات
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 mb-4">
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white shrink-0">
                <Send size={16} />
              </Button>
              <Input
                type="email"
                placeholder="بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-right bg-gray-50 border-gray-200"
              />
            </form>

            {/* Payment Methods */}
            <div className="flex gap-2 justify-end items-center flex-wrap">
              <span className="text-xs text-gray-500">طرق الدفع:</span>
              <div className="flex gap-2 items-center">
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                  <CreditCard size={14} className="text-gray-600" />
                </div>
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-600">
                  VISA
                </div>
                <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                  <Banknote size={14} className="text-gray-600" />
                </div>
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  قريباً
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Credits */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
            {/* Copyright */}
            <div className="text-gray-600">
              © {new Date().getFullYear()} Sarraly. All Rights Reserved.
            </div>

            {/* Developer Credit */}
            <div className="text-gray-600">
              Developed by{' '}
              <a
                href="https://ahmed-hany-dev-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-gray-900 hover:text-primary transition-colors"
              >
                Eng. Ahmed Hany | Founder & CEO
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
