// Products list - Tablets removed, ready for real images
const products = [
  { 
    title: "Capsules", 
    color: "bg-red-50",
    // Replace placeholder with actual image import when uploaded
    hasImage: false
  },
  { 
    title: "Sachets", 
    color: "bg-gray-100",
    hasImage: false
  },
  { 
    title: "Stick Packs", 
    color: "bg-gray-50",
    hasImage: false
  },
  { 
    title: "Resealable Pouches", 
    color: "bg-cyan-50",
    hasImage: false
  },
];

const ProductFormatsSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="section-container">
        {/* Product Cards Grid - 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <div
              key={product.title}
              className="bg-white rounded-xl border border-border card-shadow card-hover overflow-hidden"
            >
              {/* Image Placeholder - ready for real images */}
              <div className={`aspect-square ${product.color} flex items-center justify-center p-6`}>
                <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-muted-foreground">
                    {product.title.charAt(0)}
                  </span>
                </div>
              </div>

              {/* Content - Title only */}
              <div className="p-4 text-center">
                <h3 className="font-bold text-primary">{product.title}</h3>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Please upload product images to replace these placeholders
        </p>
      </div>
    </section>
  );
};

export default ProductFormatsSection;
