import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const BASE_URL = import.meta.env.VITE_APP_URL || 'https://promptquill.com';

export default function Breadcrumb({ items = [] }) {
  const location = useLocation();
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": BASE_URL
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": `${BASE_URL}${item.path}`
      }))
    ]
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      
      <nav aria-label="Breadcrumb" className="mb-6 overflow-x-auto whitespace-nowrap pb-2">
        <ol className="flex items-center space-x-2 text-sm text-zinc-400">
          <li>
            <Link to="/" className="flex items-center hover:text-purple-400 transition-colors">
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={item.path} className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-1 text-zinc-600 flex-shrink-0" />
                {isLast ? (
                  <span className="text-zinc-200 font-medium truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link 
                    to={item.path} 
                    className="hover:text-purple-400 transition-colors truncate max-w-[150px] sm:max-w-xs"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
