import { prisma } from '../src/index';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding Ethiopian Livestock Marketplace Database...');

  // 1. Categories
  const dairyCattle = await prisma.category.upsert({
    where: { slug: 'dairy-cattle' },
    update: {},
    create: {
      name: 'Dairy Cattle',
      slug: 'dairy-cattle',
      icon: '🐄',
      status: 'ACTIVE',
    },
  });

  const beefCattle = await prisma.category.upsert({
    where: { slug: 'beef-cattle' },
    update: {},
    create: {
      name: 'Beef Cattle / Bulls',
      slug: 'beef-cattle',
      icon: '🐂',
      status: 'ACTIVE',
    },
  });

  const calvesHeifers = await prisma.category.upsert({
    where: { slug: 'calves-heifers' },
    update: {},
    create: {
      name: 'Calves & Heifers',
      slug: 'calves-heifers',
      icon: '🐮',
      status: 'ACTIVE',
    },
  });

  const sheep = await prisma.category.upsert({
    where: { slug: 'sheep' },
    update: {},
    create: {
      name: 'Sheep',
      slug: 'sheep',
      icon: '🐑',
      status: 'ACTIVE',
    },
  });

  const goats = await prisma.category.upsert({
    where: { slug: 'goats' },
    update: {},
    create: {
      name: 'Goats',
      slug: 'goats',
      icon: '🐐',
      status: 'ACTIVE',
    },
  });

  // 2. Breeds
  const breedsData = [
    // Dairy
    { categoryId: dairyCattle.id, name: 'Holstein Friesian' },
    { categoryId: dairyCattle.id, name: 'Jersey' },
    { categoryId: dairyCattle.id, name: 'Cross Breed (Friesian x Borana)' },
    { categoryId: dairyCattle.id, name: 'Sahiwal' },
    { categoryId: dairyCattle.id, name: 'Local Zebu' },
    // Beef
    { categoryId: beefCattle.id, name: 'Borana Bull' },
    { categoryId: beefCattle.id, name: 'Fogera' },
    { categoryId: beefCattle.id, name: 'Begait' },
    { categoryId: beefCattle.id, name: 'Barka' },
    { categoryId: beefCattle.id, name: 'Fattened Cross Bull' },
    // Calves
    { categoryId: calvesHeifers.id, name: 'Holstein Friesian Heifer' },
    { categoryId: calvesHeifers.id, name: 'Jersey Heifer' },
    { categoryId: calvesHeifers.id, name: 'Crossbreed Calf' },
    // Sheep
    { categoryId: sheep.id, name: 'Dorper' },
    { categoryId: sheep.id, name: 'Menz Sheep' },
    { categoryId: sheep.id, name: 'Bonga' },
    { categoryId: sheep.id, name: 'Blackhead Persian' },
    { categoryId: sheep.id, name: 'Washera' },
    { categoryId: sheep.id, name: 'Local Highland Sheep' },
    // Goats
    { categoryId: goats.id, name: 'Boer Goat' },
    { categoryId: goats.id, name: 'Somali Goat' },
    { categoryId: goats.id, name: 'Hararghe Highland Goat' },
    { categoryId: goats.id, name: 'Afar Goat' },
    { categoryId: goats.id, name: 'Local Dairy Goat' },
  ];

  for (const b of breedsData) {
    const existing = await prisma.breed.findFirst({
      where: { categoryId: b.categoryId, name: b.name },
    });
    if (!existing) {
      await prisma.breed.create({ data: b });
    }
  }

  // 3. Structured Locations
  const locationsData = [
    { region: 'Oromia', city: 'Sululta', area: 'Chancho' },
    { region: 'Oromia', city: 'Sululta', area: 'Town Center' },
    { region: 'Oromia', city: 'Bishoftu', area: 'Babogaya' },
    { region: 'Oromia', city: 'Adama', area: 'Wonji Gate' },
    { region: 'Oromia', city: 'Holeta', area: 'Welmera' },
    { region: 'Oromia', city: 'Sebeta', area: 'Alem Gena' },
    { region: 'Oromia', city: 'Shashemene', area: 'Awasho' },
    { region: 'Addis Ababa', city: 'Addis Ababa', area: 'Akaki Kality' },
    { region: 'Addis Ababa', city: 'Addis Ababa', area: 'Bole Bulbula' },
    { region: 'Addis Ababa', city: 'Addis Ababa', area: 'Kolfe Keranio' },
    { region: 'Addis Ababa', city: 'Addis Ababa', area: 'Yeka' },
    { region: 'Amhara', city: 'Debre Birhan', area: 'Industrial Area' },
    { region: 'Amhara', city: 'Bahir Dar', area: 'Zenzelma' },
    { region: 'Sidama', city: 'Hawassa', area: 'Tabor' },
  ];

  for (const loc of locationsData) {
    const existing = await prisma.location.findFirst({
      where: { region: loc.region, city: loc.city, area: loc.area },
    });
    if (!existing) {
      await prisma.location.create({ data: loc });
    }
  }

  // 4. Users (Admin + Sellers)
  const passwordHash = await bcrypt.hash('MarketPass123!', 10);
  const adminPasswordHash = await bcrypt.hash('AdminSecure2026!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@axummarket.et' },
    update: {},
    create: {
      fullName: 'System Administrator',
      email: 'admin@axummarket.et',
      passwordHash: adminPasswordHash,
      phone: '+251911000001',
      role: 'ADMIN',
      status: 'ACTIVE',
      region: 'Addis Ababa',
      city: 'Addis Ababa',
    },
  });

  const sellerHayiluu = await prisma.user.upsert({
    where: { email: 'hayiluu@axummarket.et' },
    update: {},
    create: {
      fullName: 'Hayiluu Asaffaa',
      email: 'hayiluu@axummarket.et',
      passwordHash,
      phone: '+251911123456',
      role: 'SELLER',
      status: 'ACTIVE',
      region: 'Oromia',
      city: 'Sululta',
      area: 'Chancho',
    },
  });

  const sellerTariku = await prisma.user.upsert({
    where: { email: 'tariku@axummarket.et' },
    update: {},
    create: {
      fullName: 'Tariku Bekele',
      email: 'tariku@axummarket.et',
      passwordHash,
      phone: '+251922334455',
      role: 'SELLER',
      status: 'ACTIVE',
      region: 'Oromia',
      city: 'Bishoftu',
      area: 'Babogaya',
    },
  });

  const sellerAlmaz = await prisma.user.upsert({
    where: { email: 'almaz@axummarket.et' },
    update: {},
    create: {
      fullName: 'Almaz Desta',
      email: 'almaz@axummarket.et',
      passwordHash,
      phone: '+251933778899',
      role: 'SELLER',
      status: 'ACTIVE',
      region: 'Addis Ababa',
      city: 'Addis Ababa',
      area: 'Akaki Kality',
    },
  });

  // Pending seller to test admin approval workflow
  await prisma.user.upsert({
    where: { email: 'kenenisa@axummarket.et' },
    update: {},
    create: {
      fullName: 'Kenenisa Gudina',
      email: 'kenenisa@axummarket.et',
      passwordHash,
      phone: '+251944112233',
      role: 'SELLER',
      status: 'PENDING',
      region: 'Oromia',
      city: 'Adama',
      area: 'Wonji Gate',
    },
  });

  // 5. Listings & 3-Angle Images
  const holsteinBreed = await prisma.breed.findFirst({ where: { name: 'Holstein Friesian' } });
  const boranaBreed = await prisma.breed.findFirst({ where: { name: 'Borana Bull' } });
  const dorperBreed = await prisma.breed.findFirst({ where: { name: 'Dorper' } });
  const boerBreed = await prisma.breed.findFirst({ where: { name: 'Boer Goat' } });
  const heiferBreed = await prisma.breed.findFirst({ where: { name: 'Holstein Friesian Heifer' } });

  const listingsToSeed = [
    {
      sellerId: sellerHayiluu.id,
      categoryId: dairyCattle.id,
      breedId: holsteinBreed?.id,
      title: 'High-Yielding Holstein Friesian Dairy Cow (22L Daily)',
      description: 'Second calving Holstein Friesian dairy cow in peak lactation. Currently producing 22 liters of milk per day with standard dairy ration and hay. Very docile, easy to hand-milk or machine-milk. Regularly dewormed and vaccinated. Serious buyers are welcome to visit Sululta Chancho for morning/evening milking inspection.',
      price: 175000,
      age: '4.5 years',
      gender: 'FEMALE',
      region: 'Oromia',
      city: 'Sululta',
      area: 'Chancho',
      contactPhone: '+251911123456',
      status: 'ACTIVE',
      images: [
        { imageType: 'FRONT', imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'LEFT', imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'RIGHT', imageUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=1200&q=80' },
      ],
    },
    {
      sellerId: sellerTariku.id,
      categoryId: beefCattle.id,
      breedId: boranaBreed?.id,
      title: 'Prime Borana Fattened Bull for Holiday / Event',
      description: 'Well-fed Borana bull fattened for 4 months on concentrate and teff straw in Bishoftu. Outstanding muscle definition and weight (approx 460kg). Clean health records, zero issues. Inspection available on farm premises.',
      price: 135000,
      age: '3.5 years',
      gender: 'MALE',
      region: 'Oromia',
      city: 'Bishoftu',
      area: 'Babogaya',
      contactPhone: '+251922334455',
      status: 'ACTIVE',
      images: [
        { imageType: 'FRONT', imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'LEFT', imageUrl: 'https://images.unsplash.com/photo-1551214352-73600fc16694?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'RIGHT', imageUrl: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80' },
      ],
    },
    {
      sellerId: sellerTariku.id,
      categoryId: sheep.id,
      breedId: dorperBreed?.id,
      title: 'Purebred Dorper Breeding Ram (South Africa Lineage)',
      description: 'High genetic potential Dorper breeding ram. Excellent body mass, fast growth trait transfer for sheep flock improvement. Healthy, strong hooves, ready for service.',
      price: 36000,
      age: '2 years',
      gender: 'MALE',
      region: 'Oromia',
      city: 'Bishoftu',
      area: 'Babogaya',
      contactPhone: '+251922334455',
      status: 'ACTIVE',
      images: [
        { imageType: 'FRONT', imageUrl: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'LEFT', imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'RIGHT', imageUrl: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80' },
      ],
    },
    {
      sellerId: sellerAlmaz.id,
      categoryId: goats.id,
      breedId: boerBreed?.id,
      title: 'Boer Cross Stud Buck (High Fertility Strain)',
      description: 'Vigorous and healthy male buck with excellent bone structure and broad chest. Raised under stall feeding with lucerne grass and bran. Direct call to arrange visit.',
      price: 26500,
      age: '18 months',
      gender: 'MALE',
      region: 'Addis Ababa',
      city: 'Addis Ababa',
      area: 'Akaki Kality',
      contactPhone: '+251933778899',
      status: 'ACTIVE',
      images: [
        { imageType: 'FRONT', imageUrl: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'LEFT', imageUrl: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'RIGHT', imageUrl: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1200&q=80' },
      ],
    },
    {
      sellerId: sellerHayiluu.id,
      categoryId: calvesHeifers.id,
      breedId: heiferBreed?.id,
      title: 'Pregnant Holstein Heifer (Confirmed 4 Months in Calf)',
      description: 'Pedigree artificial insemination sired Holstein heifer. Confirmed 4 months pregnant by certified veterinary sonogram. Gentle temperament, great udder promise.',
      price: 115000,
      age: '22 months',
      gender: 'FEMALE',
      region: 'Oromia',
      city: 'Sululta',
      area: 'Town Center',
      contactPhone: '+251911123456',
      status: 'ACTIVE',
      images: [
        { imageType: 'FRONT', imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'LEFT', imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'RIGHT', imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80' },
      ],
    },
    {
      sellerId: sellerHayiluu.id,
      categoryId: dairyCattle.id,
      breedId: holsteinBreed?.id,
      title: 'Jersey Cross Dairy Cow (16 Liters Morning & Evening)',
      description: 'Healthy family dairy cow producing rich creamy milk (high butterfat). Calm for children and family handling. Available for inspection in Sululta.',
      price: 145000,
      age: '4 years',
      gender: 'FEMALE',
      region: 'Oromia',
      city: 'Sululta',
      area: 'Chancho',
      contactPhone: '+251911123456',
      status: 'ACTIVE',
      images: [
        { imageType: 'FRONT', imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'LEFT', imageUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'RIGHT', imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80' },
      ],
    },
    // A pending listing to test Admin moderation
    {
      sellerId: sellerTariku.id,
      categoryId: beefCattle.id,
      breedId: boranaBreed?.id,
      title: 'Young Borana Bull (Pasture Raised)',
      description: 'Strong young Borana bull ready for breeding or backgrounding. Waiting for admin approval.',
      price: 88000,
      age: '2.5 years',
      gender: 'MALE',
      region: 'Oromia',
      city: 'Bishoftu',
      area: 'Babogaya',
      contactPhone: '+251922334455',
      status: 'PENDING',
      images: [
        { imageType: 'FRONT', imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'LEFT', imageUrl: 'https://images.unsplash.com/photo-1551214352-73600fc16694?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'RIGHT', imageUrl: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80' },
      ],
    },
    // A sold listing to test Sold state
    {
      sellerId: sellerAlmaz.id,
      categoryId: sheep.id,
      breedId: dorperBreed?.id,
      title: 'Fatted Highland Ewe (Sold Example)',
      description: 'Already inspected and purchased offline. Marked as sold by seller.',
      price: 15000,
      age: '2 years',
      gender: 'FEMALE',
      region: 'Addis Ababa',
      city: 'Addis Ababa',
      area: 'Akaki Kality',
      contactPhone: '+251933778899',
      status: 'SOLD',
      images: [
        { imageType: 'FRONT', imageUrl: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'LEFT', imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80' },
        { imageType: 'RIGHT', imageUrl: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80' },
      ],
    },
  ];

  for (const item of listingsToSeed) {
    const { images, ...data } = item;
    const existing = await prisma.listing.findFirst({
      where: { title: data.title, sellerId: data.sellerId },
    });

    if (!existing) {
      const listing = await prisma.listing.create({
        data,
      });

      for (const img of images) {
        await prisma.listingImage.create({
          data: {
            listingId: listing.id,
            imageUrl: img.imageUrl,
            imageType: img.imageType,
          },
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

