import { Film, MapPin, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Main info */}
          <div>
            <h4 className="font-display tracking-wider mb-3 text-sm">GRAPHITE</h4>
            <p className="font-serif text-xs text-gray-400 leading-relaxed mb-3">
              Historické kino věnované klasickému černo-bílému filmu 
              v autentickém prostředí v srdci Pardubic.
            </p>
            <div className="flex gap-4">
              <div className="w-6 h-6 bg-[#912D3C] flex items-center justify-center">
                <Film className="w-3 h-3 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div id="kontakt">
            <h4 className="font-display tracking-wider text-[#912D3C] mb-3 text-sm">KONTAKTY</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-[#912D3C]" strokeWidth={2} />
                Filmová 123, Pardubice 1
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-[#912D3C]" strokeWidth={2} />
                +420 123 456 789
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-[#912D3C]" strokeWidth={2} />
                info@graphite-kino.cz
              </p>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-display tracking-wider text-[#912D3C] mb-3 text-sm">OTEVŘENO</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <p>Po-Pá: 17:00 - 23:00</p>
              <p>So-Ne: 15:00 - 23:00</p>
              <p className="text-xs text-gray-500 pt-2">
                Pokladna otevřena 30 min před představením
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px w-12 bg-[#912D3C]"></div>
            <Film className="text-[#912D3C] w-5 h-5" strokeWidth={2} />
            <div className="h-px w-12 bg-[#912D3C]"></div>
          </div>
          <p className="font-display text-xs text-gray-500 tracking-widest">
            © 2025 GRAPHITE KINEMATOGRAF • VŠECHNA PRÁVA VYHRAZENA
          </p>
        </div>
      </div>
    </footer>
  );
};