import { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, ChevronDown, Mail, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

const faqs = [
  { q: 'How do I get paid?', a: 'TaskLance uses a secure Escrow system. Clients fund milestones upfront, and funds are released to you once the work is approved.' },
  { q: 'What is the platform fee?', a: 'We charge a flat 10% fee on all completed milestones. There are no hidden charges or subscription fees.' },
  { q: 'Can I change my role later?', a: 'Yes, you can have both Client and Freelancer profiles attached to a single account and switch between them.' },
  { q: 'How do disputes work?', a: 'If you cannot resolve an issue with your client/freelancer, you can open a dispute. Our mediation team will review the case and make a binding decision.' },
];

export default function HelpSupport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-display font-bold mb-4">How can we help?</h1>
        <div className="max-w-xl mx-auto relative">
          <Input 
            placeholder="Search for articles, guides, or FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
            className="h-14 text-base"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-xl font-display font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-border-color rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-2 transition-colors text-left font-medium"
                  >
                    {faq.q}
                    <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === idx ? 'rotate-180 text-primary' : 'text-text-muted'}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 bg-surface-2 text-text-muted border-t border-border-color text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-text-muted mb-4">Chat with our support team in real-time.</p>
              <Button className="w-full">Start Chat</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 text-secondary">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-sm text-text-muted mb-4">Send us an email and we'll reply within 24h.</p>
              <Button variant="outline" className="w-full">Contact Support</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
