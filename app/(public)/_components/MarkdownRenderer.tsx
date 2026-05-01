import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-public-serif text-[34px] md:text-[42px] font-medium leading-tight text-public-text-dark mt-12 mb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-public-serif text-[28px] md:text-[34px] font-medium leading-tight text-public-text-dark mt-10 mb-4">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-public-serif text-[22px] md:text-[26px] font-semibold text-public-text-dark mt-8 mb-3">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-[17px] leading-[1.75] text-public-text-medium mb-6">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-public-accent-taupe-dark underline underline-offset-4 decoration-1 hover:text-public-accent-taupe transition-colors"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-6 space-y-2 text-[17px] text-public-text-medium">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="leading-[1.65]">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-public-accent-warm pl-6 my-6 italic text-public-text-medium">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-public-text-dark">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          img: ({ src, alt }) => {
            if (!src || typeof src !== 'string') return null;
            return (
              <span className="block relative w-full aspect-[16/9] my-8 rounded-xl overflow-hidden">
                <Image
                  src={src}
                  alt={alt || ''}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </span>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
