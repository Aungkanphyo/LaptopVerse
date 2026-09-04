import { useGetContactSettingsQuery } from "@/features/contact/contactApiSlice";
import { Mail, Phone, MapPin, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ContactSection = () => {
  const { data, isLoading } = useGetContactSettingsQuery();
  const settings = data?.settings;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for contacting us! We will reply shortly.");
  };

  return (
    <section id="contact" className="py-16 bg-slate-50 border-t border-gray-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider">Get In Touch</span>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-1">Have Questions? We Are Here To Help</h2>
              <p className="text-gray-600 text-sm mt-2">
                Need help choosing a laptop or ordering in bulk? We're here for you!
              </p>
            </div>

            {isLoading ? (
              <Loader2 className="size-6 animate-spin text-blue-600" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm border border-gray-100">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><Mail className="size-5" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Email Us</h4>
                    <p className="text-xs text-gray-600">{settings?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm border border-gray-100">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600"><Phone className="size-5" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Direct Line</h4>
                    <p className="text-xs text-gray-600">{settings?.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm border border-gray-100">
                  <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600"><MapPin className="size-5" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Store Location</h4>
                    <p className="text-xs text-gray-600">{settings?.address}</p>
                  </div>
                </div>

                {settings?.workingHours && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm border border-gray-100">
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-600"><Clock className="size-5" /></div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Working Hours</h4>
                      <p className="text-xs text-gray-600">{settings?.workingHours}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Send Message</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Your Name</label>
              <input type="text" required placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
              <input type="email" required placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Message</label>
              <textarea rows={4} required placeholder="Tell us what you are looking for..." className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600" />
            </div>
            <button type="submit" className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all">
              Submit Inquiry
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;