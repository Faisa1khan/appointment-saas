import { ImageResponse } from 'next/og'

export const GET = () => {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 320,
          background: '#09090b',
          color: '#ffffff',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '128px',
          fontWeight: 700,
        }}
      >
        A
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}
