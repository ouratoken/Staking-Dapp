import React from 'react';
import { Mail, MessageCircle, Phone, MapPin, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

export function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We will get back to you soon.');
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Get in Touch</h1>
        <p className="text-slate-400">We're here to help. Reach out to our support team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg mt-1">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white font-medium">support@ourastaking.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg mt-1">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Live Chat</p>
                  <p className="text-white font-medium">Available 24/7</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg mt-1">
                  <Phone className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="text-white font-medium">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg mt-1">
                  <MapPin className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Office</p>
                  <p className="text-white font-medium">123 Crypto Street, San Francisco, CA 94102</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-500/20 rounded-lg mt-1">
                  <Clock className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Business Hours</p>
                  <p className="text-white font-medium">Mon-Fri: 9AM - 6PM PST</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-3">Quick Help</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg text-slate-300 hover:text-white transition-colors">
                How to deposit funds?
              </button>
              <button className="w-full text-left p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg text-slate-300 hover:text-white transition-colors">
                Staking pool explained
              </button>
              <button className="w-full text-left p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg text-slate-300 hover:text-white transition-colors">
                Withdrawal process
              </button>
              <button className="w-full text-left p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg text-slate-300 hover:text-white transition-colors">
                Account security
              </button>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Tell us more about your inquiry..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-3">Important Notice</h3>
        <p className="text-slate-300 leading-relaxed">
          This is a simulated staking platform. All deposits, withdrawals, and staking operations require admin approval. 
          Please ensure you submit accurate information when making requests. For urgent matters, please contact our support team directly.
        </p>
      </div>
    </div>
  );
}