import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: '#137fec',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: 'white' }}
        >
           <path 
             d="M12 2L2 7L12 12L22 7L12 2Z" 
             stroke="currentColor" 
             strokeWidth="2.5" 
             strokeLinecap="round" 
             strokeLinejoin="round"
           />
           <path 
             d="M2 17L12 22L22 17" 
             stroke="currentColor" 
             strokeWidth="2.5" 
             strokeLinecap="round" 
             strokeLinejoin="round"
           />
           <path 
             d="M2 12L12 17L22 12" 
             stroke="currentColor" 
             strokeWidth="2.5" 
             strokeLinecap="round" 
             strokeLinejoin="round"
           />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
