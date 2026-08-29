export default function ProductGlyph({ product, mini = false, className = "" }) {
  const baseClass = mini ? "mini-glyph" : "product-glyph";
  return (
    <span className={`${baseClass} glyph-${product.vertical} ${className}`.trim()} aria-hidden="true">
      {product.icon}
    </span>
  );
}
