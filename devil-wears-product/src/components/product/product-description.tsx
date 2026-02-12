interface ProductDescriptionProps {
  html: string;
}

export function ProductDescription({ html }: ProductDescriptionProps) {
  return (
    <div
      className="prose prose-sm max-w-none text-charcoal-light prose-headings:font-headline prose-headings:text-charcoal prose-a:text-pink prose-a:no-underline hover:prose-a:underline prose-strong:text-charcoal"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
