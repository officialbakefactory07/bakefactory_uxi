import { NextResponse } from 'next/server';

function extractArea(addr: any, displayName: string = ''): string {
  // Street / Road / Highway
  const street = addr.road || addr.street || addr.pedestrian || addr.footway || addr.path || addr.highway || '';
  
  // Colony / Residential / Society / Nagar / Layout
  const colony = addr.residential || addr.neighbourhood || addr.subdivision || addr.housing_development || '';
  
  // Locality / Suburb / Quarter
  const locality = addr.suburb || addr.city_district || addr.subdistrict || addr.quarter || '';
  
  // Village / Hamlet / Town
  const villageOrTown = addr.village || addr.hamlet || '';

  const areaTokens: string[] = [];
  if (street) areaTokens.push(street);
  if (colony && !areaTokens.includes(colony)) areaTokens.push(colony);
  if (locality && !areaTokens.includes(locality)) areaTokens.push(locality);
  if (villageOrTown && !areaTokens.includes(villageOrTown)) areaTokens.push(villageOrTown);

  let area = areaTokens.join(', ');

  // If areaTokens are sparse or empty, extract first 2 meaningful tokens from display_name
  if (!area && displayName) {
    const rawTokens = displayName.split(',').map((s: string) => s.trim());
    const cleaned = rawTokens.filter((t: string) => 
      !/India|Andhra Pradesh|Telangana|Karnataka|Tamil Nadu|Kerala|Maharashtra|\b\d{6}\b/i.test(t)
    );
    area = cleaned.slice(0, 2).join(', ');
  }

  return area;
}

function extractCity(addr: any, displayName: string = ''): string {
  // Specific local city/town checks in display name first
  if (/mangalagiri/i.test(displayName)) return 'Mangalagiri';
  if (/tadepalle/i.test(displayName)) return 'Tadepalle';
  if (/vijayawada/i.test(displayName)) return 'Vijayawada';
  if (/guntur/i.test(displayName)) return 'Guntur';
  if (/hyderabad/i.test(displayName)) return 'Hyderabad';
  if (/visakhapatnam|vizag/i.test(displayName)) return 'Visakhapatnam';

  // Standard address keys
  let rawCity = addr.city || addr.town || addr.municipality || '';
  if (!rawCity || /authority|region|development|corporation/i.test(rawCity)) {
    rawCity = addr.county || addr.town || addr.state_district || addr.village || 'Vijayawada';
  }

  return rawCity.replace(/\s*\([^)]*\)/g, '').replace(/\s*district\b/i, '').trim() || 'Vijayawada';
}

function extractPincode(addr: any, displayName: string = ''): string {
  if (addr.postcode) {
    const m = addr.postcode.match(/\b\d{6}\b/);
    if (m) return m[0];
  }
  if (displayName) {
    const m = displayName.match(/\b\d{6}\b/);
    if (m) return m[0];
  }
  return '520010';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Latitude and Longitude are required' }, { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  try {
    // 1. Primary: Nominatim (OpenStreetMap) with zoom=18 for precise building/street details
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BakeFactoryFoodDelivery/2.0 (orders@bakefactory.in)',
          'Accept-Language': 'en'
        },
        next: { revalidate: 300 }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};

      const area = extractArea(addr, data.display_name || '');
      const city = extractCity(addr, data.display_name || '');
      const pincode = extractPincode(addr, data.display_name || '');
      const landmark = addr.amenity || addr.shop || addr.building || addr.office || addr.tourism || '';

      return NextResponse.json({
        success: true,
        area: area || data.display_name?.split(',').slice(0, 2).join(', ').trim() || '',
        city,
        pincode,
        landmark,
        displayName: data.display_name || ''
      });
    }

    // 2. Secondary Fallback: BigDataCloud Reverse Geocoding
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const info = bdcData.localityInfo?.informative || [];
      
      let area = bdcData.locality || '';
      const fine = info.find((x: any) => 
        x.name && 
        x.name !== bdcData.city && 
        x.name !== bdcData.countryName && 
        x.name !== bdcData.principalSubdivision
      )?.name;
      
      if (fine && fine !== area) {
        area = fine + (area ? ', ' + area : '');
      }

      let city = bdcData.city || 'Vijayawada';
      if (/mangalagiri/i.test(area) || /mangalagiri/i.test(city)) city = 'Mangalagiri';
      else if (/tadepalle/i.test(area) || /tadepalle/i.test(city)) city = 'Tadepalle';
      else if (/vijayawada/i.test(area) || /vijayawada/i.test(city)) city = 'Vijayawada';
      else if (/guntur/i.test(area) || /guntur/i.test(city)) city = 'Guntur';

      const pincode = bdcData.postcode?.match(/\b\d{6}\b/)?.[0] || '520010';

      return NextResponse.json({
        success: true,
        area: area || city,
        city,
        pincode,
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
