import { useGetContactSettingsQuery } from "@/features/contact/contactApiSlice";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ContactSection = () => {
  const { data, isLoading } = useGetContactSettingsQuery();
  const settings = data?.settings;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for contacting us! We will reply shortly.");
  };

  return (
    <section id="contact" className="py-16 bg-[#080b14] border-t border-slate-800/80 scroll-mt-16 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div>
              <span className="text-blue-500 font-bold text-xs uppercase tracking-wider">GET IN TOUCH</span>
              <h2 className="text-3xl font-black text-white mt-1">Have Questions? We Are Here To Help</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2">
                Reach out to our specialist sales representatives for personalized recommendations or bulk order inquiries.
              </p>
            </div>

            {isLoading ? (
              <Loader2 className="size-6 animate-spin text-blue-500" />
            ) : (
              <div className="space-y-3">
                
                {/* Email Card */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#0d1222] border border-slate-800/80">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400"><Mail className="size-5" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400">Email Us</h4>
                    <p className="text-sm font-semibold text-white mt-0.5">{settings?.email || "support@laptopverse.tech"}</p>
                  </div>
                </div>

                {/* Direct Line Card */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#0d1222] border border-slate-800/80">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400"><Phone className="size-5" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400">Direct Line</h4>
                    <p className="text-sm font-semibold text-white mt-0.5">{settings?.phone || "+1 (800) 456-7890"}</p>
                  </div>
                </div>

                {/* Store Location Card */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#0d1222] border border-slate-800/80">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400"><MapPin className="size-5" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400">Store Location</h4>
                    <p className="text-sm font-semibold text-white mt-0.5">{settings?.address || "100 Tech Plaza, Silicon Hub, California"}</p>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-[#0d1222] p-8 rounded-3xl border border-slate-800/80 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Send Message</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Your Name</label>
              <input 
                type="text" 
                required 
                placeholder="John Doe" 
                className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="john@example.com" 
                className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Message</label>
              <textarea 
                rows={4} 
                required 
                placeholder="Tell us what you are looking for..." 
                className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none" 
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
            >
              Submit Inquiry
            </button>
          </form>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;