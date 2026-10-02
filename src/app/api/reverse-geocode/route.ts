import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and Longitude are required' }, { status: 400 });
  }

  try {
    // 1. Try Nominatim (OpenStreetMap) with detailed address breakdown
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BakeFactoryApp/1.0 (info@bakefactory.com)',
          'Accept-Language': 'en'
        },
        next: { revalidate: 300 }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};

      // Build readable area / locality
      const areaParts = [
        addr.road,
        addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict,
      ].filter(Boolean);

      const area = areaParts.join(', ') || addr.village || addr.city_district || addr.county || '';
      
      // Determine City (focusing on local region)
      let city = addr.city || addr.town || addr.village || addr.county || 'Vijayawada';
      if (/vijayawada/i.test(city) || /krishna/i.test(addr.state_district || '')) {
        city = 'Vijayawada';
      } else if (/tadepalle/i.test(city)) {
        city = 'Tadepalle';
      } else if (/guntur/i.test(city)) {
        city = 'Guntur';
      } else if (/mangalagiri/i.test(city)) {
        city = 'Mangalagiri';
      }

      const pincode = addr.postcode ? addr.postcode.replace(/\D/g, '').slice(0, 6) : '';
      const landmark = addr.amenity || addr.shop || addr.building || '';

      return NextResponse.json({
        success: true,
        area: area || data.display_name?.split(',').slice(0, 2).join(',').trim() || '',
        city,
        pincode,
        landmark,
        displayName: data.display_name || ''
      });
    }

    // 2. Fallback to BigDataCloud free client geocoding API if Nominatim is rate-limited
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      return NextResponse.json({
        success: true,
        area: [bdcData.locality, bdcData.principalSubdivision].filter(Boolean).join(', '),
        city: bdcData.city || 'Vijayawada',
        pincode: bdcData.postcode?.replace(/\D/g, '').slice(0, 6) || '',
        landmark: '',
        displayName: bdcData.locality || ''
      });
    }

    return NextResponse.json({ error: 'Unable to reverse geocode location' }, { status: 502 });
  } catch (error: any) {
    console.error('Reverse Geocode API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
