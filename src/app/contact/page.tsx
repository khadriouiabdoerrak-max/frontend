'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          message: formData.message,
        }),
      });
      if (!res.ok) throw new Error('FAILED');
      setSubmitted(true);
    } catch {
      setError('حدث خطأ أثناء إرسال الرسالة. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-8 pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-cocoa mb-3">
            تواصلي معنا
          </h1>
          <p className="text-secondary text-sm max-w-md mx-auto leading-relaxed">
            لديكِ سؤال حول المنتج المناسب لشعركِ؟ أو تريدين تأكيد طلبكِ؟
            فريق تاجكِ رهن إشارتكِ.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
            {[
              {
                icon: Phone,
                title: 'الهاتف / واتساب',
                value: '+212 6 00 00 00 00',
                note: 'من الإثنين إلى السبت (9ص - 6م)',
                dir: 'ltr',
              },
              {
                icon: Mail,
                title: 'البريد الإلكتروني',
                value: 'contact@oxiprime.store',
                note: 'نرد خلال 24 ساعة',
                dir: undefined,
              },
              {
                icon: MapPin,
                title: 'خدمة داخل المغرب',
                value: 'المغرب',
                note: 'توصيل في جميع المدن',
                dir: undefined,
              },
            ].map(({ icon: Icon, title, value, note, dir }) => (
              <div
                key={title}
                className="bg-ivory rounded-card border border-champagne/30 p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-cocoa rounded-full flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="font-bold text-sm text-cocoa">{title}</p>
                  <p
                    className="text-sm text-secondary mt-1 font-sans"
                    dir={dir as 'ltr' | 'rtl' | undefined}
                  >
                    {value}
                  </p>
                  <p className="text-xs text-muted-brown mt-0.5">{note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-ivory rounded-card border border-champagne/30 p-10 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 bg-success/10 text-success rounded-full flex items-center justify-center">
                  <Send className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-cocoa">
                  تم إرسال رسالتكِ
                </h2>
                <p className="text-sm text-secondary">
                  سنتواصل معكِ في أقرب وقت ممكن.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-ivory rounded-card border border-champagne/30 p-6 sm:p-8 space-y-5"
              >
                {error && (
                  <div className="p-3 bg-red-50 text-error text-sm rounded-card border border-red-100">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-cocoa mb-1.5">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full p-3 border border-champagne/50 rounded-btn bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-cocoa"
                    placeholder="الاسم والنسب"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-cocoa mb-1.5">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full p-3 border border-champagne/50 rounded-btn bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-left text-cocoa font-sans"
                    placeholder="06 XX XX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-cocoa mb-1.5">
                    المدينة
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full p-3 border border-champagne/50 rounded-btn bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-cocoa"
                    placeholder="مثلا: الدار البيضاء"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-cocoa mb-1.5">
                    الرسالة
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full p-3 border border-champagne/50 rounded-btn bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none text-cocoa"
                    placeholder="اكتبي رسالتكِ هنا..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cocoa text-ivory py-4 font-bold rounded-btn hover:bg-espresso transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <span>جاري الإرسال...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>أرسلي الرسالة</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
