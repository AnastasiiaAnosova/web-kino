export const AboutSection = () => {
  return (
    <section id="o-nas" className="py-16 bg-gradient-to-b from-[#f9f9f9] to-[#f5f5f5]">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl tracking-wider mb-4">GRAPHITE KINEMATOGRAF</h2>
          <div className="w-24 h-1 bg-[#912D3C] mx-auto mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Card 1 */}
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 bg-black transform rotate-1 group-hover:rotate-2 transition-transform duration-300 shadow-lg group-hover:shadow-2xl" />
              <div className="relative bg-white border-4 border-black p-6 group-hover:-translate-y-1 transition-all duration-300">
                <div className="overflow-hidden">
                  <h4 className="font-display text-lg tracking-wider mb-4 group-hover:text-[#912D3C] transition-colors">HISTORIE</h4>
                </div>
                <p className="font-serif text-sm text-gray-700 leading-relaxed">
                  Založeno 1925 v srdci Pardubic. Autentické Art Deco interiéry 
                  zachovávají atmosféru zlatého věku kinematografie.
                </p>
                <div className="h-1 bg-[#912D3C] mt-4 w-0 group-hover:w-full transition-all duration-500" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 bg-black transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300 shadow-lg group-hover:shadow-2xl" />
              <div className="relative bg-white border-4 border-black p-6 group-hover:-translate-y-1 transition-all duration-300">
                <div className="overflow-hidden">
                  <h4 className="font-display text-lg tracking-wider mb-4 group-hover:text-[#912D3C] transition-colors">ATMOSFÉRA</h4>
                </div>
                <p className="font-serif text-sm text-gray-700 leading-relaxed">
                  Autentický zážitek černo-bílého filmu v původním prostředí 
                  s historickými detaily a dobovou atmosférou.
                </p>
                <div className="h-1 bg-[#912D3C] mt-4 w-0 group-hover:w-full transition-all duration-500" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 bg-black transform rotate-1 group-hover:rotate-2 transition-transform duration-300 shadow-lg group-hover:shadow-2xl" />
              <div className="relative bg-white border-4 border-black p-6 group-hover:-translate-y-1 transition-all duration-300">
                <div className="overflow-hidden">
                  <h4 className="font-display text-lg tracking-wider mb-4 group-hover:text-[#912D3C] transition-colors">PROGRAM</h4>
                </div>
                <p className="font-serif text-sm text-gray-700 leading-relaxed">
                  Kurátorský výběr klasických děl i zapomenutých skvostů 
                  světové kinematografie zlaté éry.
                </p>
                <div className="h-1 bg-[#912D3C] mt-4 w-0 group-hover:w-full transition-all duration-500" />
              </div>
            </div>
          </div>

          <blockquote className="font-serif text-2xl italic text-gray-800 mb-4">
            "Kino je nejkrásnější podvod na světě."
          </blockquote>
          <cite className="font-display text-sm text-gray-600 tracking-wider">
            — JEAN-LUC GODARD
          </cite>
        </div>
      </div>
    </section>
  );
};