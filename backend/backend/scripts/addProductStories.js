require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

const productStories = {
  'Arabica AA Nyeri Beans': {
    intro: 'Grown on the fertile volcanic slopes of Nyeri County, these premium Arabica AA beans represent the pinnacle of Kenyan coffee excellence. Cultivated at 1800 meters above sea level, each bean captures the unique terroir of Central Kenya, delivering complex floral notes and a wine-like acidity that coffee connoisseurs treasure.',
    farmerBackground: 'Our farmer has been tending coffee trees in Nyeri for over two decades, inheriting the craft from their parents who were among the first smallholder farmers in the region. With deep knowledge of the land and a commitment to sustainable farming, they nurture each tree with care, ensuring only the ripest cherries are selected during harvest.',
    farmDetails: {
      location: 'Nyeri County, Central Kenya - on the slopes of the Aberdare Range',
      size: '3.5 hectares of terraced coffee plantation',
      altitude: '1800 meters above sea level',
      practices: 'Organic composting, shade-grown under native trees, hand-picked harvesting, water conservation through drip irrigation, and intercropping with bananas for additional income and soil protection.'
    },
    processingJourney: 'After careful hand-picking, the cherries undergo the traditional washed process at a local cooperative mill. The beans are pulped within hours of harvest, fermented for 24-36 hours to develop their characteristic brightness, then sun-dried on raised beds for 10-14 days. This meticulous process preserves the beans\' complex flavor profile and ensures consistent quality.',
    impact: 'Every purchase directly supports our farmer\'s family and contributes to the local cooperative, which provides education scholarships for farmers\' children, maintains clean water infrastructure, and offers training in sustainable agriculture practices. Your choice helps preserve traditional coffee farming while building a more prosperous community.'
  },

  'Robusta Kirinyaga Ground': {
    intro: 'From the lush hills of Kirinyaga County comes this bold Robusta coffee, ground fresh for your convenience. Grown at 1600 meters, these beans deliver a full-bodied, earthy cup with notes of dark chocolate and a smooth, lingering finish. Perfect for espresso lovers and those who appreciate a stronger morning brew.',
    farmerBackground: 'Our Kirinyaga farmer specializes in Ruiru 11, a disease-resistant hybrid variety developed specifically for Kenyan conditions. With fifteen years of experience, they have mastered the art of cultivating robust, flavorful beans while maintaining environmental stewardship of their land.',
    farmDetails: {
      location: 'Kirinyaga County, at the foot of Mount Kenya',
      size: '2.8 hectares of sloped farmland',
      altitude: '1600 meters above sea level',
      practices: 'Integrated pest management, natural mulching, selective pruning for optimal yield, rainwater harvesting, and participation in Fair Trade certification programs.'
    },
    processingJourney: 'The cherries are processed using the washed method at a nearby factory, ensuring cleanliness and quality control. After fermentation and washing, beans are sun-dried on traditional raised tables, turned regularly by hand to ensure even drying. The dried parchment is then milled and carefully graded before being roasted and ground to perfection.',
    impact: 'This coffee supports a family-run farm that employs five seasonal workers during harvest. Proceeds help fund a local primary school, provide healthcare access through a community clinic, and maintain the irrigation channels that benefit the entire village.'
  },

  'Blend Kiambu Beans': {
    intro: 'A harmonious blend from the green highlands of Kiambu County, where coffee tradition runs deep. These SL34 beans, grown at 1700 meters, are naturally processed to bring out their inherent sweetness and fruity complexity. The result is a balanced, mellow cup with notes of berries and caramel.',
    farmerBackground: 'Farming in Kiambu since 2008, our farmer is passionate about preserving heirloom varieties like SL34. They have transformed their small plot into a model of sustainable agriculture, combining traditional wisdom with modern organic practices to produce exceptional coffee year after year.',
    farmDetails: {
      location: 'Kiambu County, in the Central Highlands',
      size: '4 hectares of gently rolling farmland',
      altitude: '1700 meters above sea level',
      practices: 'Certified organic farming, composting with coffee pulp, biological pest control, contour planting to prevent erosion, and agroforestry with indigenous shade trees.'
    },
    processingJourney: 'These beans undergo natural processing, where the cherries are dried whole in the sun, allowing the fruit\'s sugars to infuse the beans with extra sweetness. After three weeks of careful drying and daily turning, the dried fruit is mechanically removed, revealing perfectly fermented beans with enhanced flavor complexity.',
    impact: 'Supporting this coffee means investing in organic agriculture education in Kiambu. The farm serves as a training center for neighboring farmers interested in transitioning to organic methods, and revenues help maintain a local women\'s cooperative that processes and markets their collective harvest.'
  },

  "Arabica Murang'a Ground": {
    intro: 'High-altitude Arabica from the fertile ridges of Murang\'a County, where misty mornings and volcanic soil create ideal conditions for specialty coffee. Lightly roasted to preserve its bright, fruity character, this ground coffee delivers a clean, crisp cup with notes of citrus and jasmine.',
    farmerBackground: 'A third-generation coffee farmer in Murang\'a, our producer learned the trade from their grandparents who first planted SL28 trees in the 1960s. Their intimate knowledge of the land and commitment to quality have earned them recognition at regional coffee competitions.',
    farmDetails: {
      location: 'Murang\'a County, Central Highlands of Kenya',
      size: '3 hectares of terraced hillside plantation',
      altitude: '1650 meters above sea level',
      practices: 'Traditional shade-growing under macadamia trees, manual weeding to avoid herbicides, composting with farm waste, selective harvesting of only ripe cherries, and participation in climate-smart agriculture programs.'
    },
    processingJourney: 'Cherries are delivered to a cooperative mill within four hours of picking. The natural processing method allows the fruit to dry around the bean for 21 days, developing intense fruity flavors. Beans are then hulled, sorted by density and size, lightly roasted to highlight their natural brightness, and ground to a medium consistency.',
    impact: 'Your purchase supports community-led development initiatives in Murang\'a, including a borehole project providing clean water to 200 families, a tree nursery program planting 5,000 seedlings annually, and a youth mentorship program training the next generation of coffee farmers.'
  },

  'Robusta Embu Beans': {
    intro: 'From the eastern ridges of Embu County comes this earthy, full-bodied Robusta. Naturally processed at 1550 meters, these Ruiru 11 beans offer intense flavor, strong body, and a pleasant bitterness that makes them ideal for blending or enjoying as a bold single-origin brew.',
    farmerBackground: 'Our Embu farmer has cultivated coffee for twelve years, specializing in Ruiru 11 for its resilience and consistent quality. They are active in their local cooperative, sharing knowledge and resources to improve yields and quality across the entire farming community.',
    farmDetails: {
      location: 'Embu County, on the southeastern slopes of Mount Kenya',
      size: '2.5 hectares of mixed farmland',
      altitude: '1550 meters above sea level',
      practices: 'Intercropping with maize and beans, organic pest control using neem extracts, mulching with coffee husks, soil testing and amendment, and participation in farmer field schools for continuous learning.'
    },
    processingJourney: 'These beans are naturally processed, with whole cherries spread on raised drying beds immediately after harvest. Over 18-20 days of sun drying with regular turning, the beans develop their characteristic deep, earthy flavors. After drying, the fruit is mechanically removed and beans are sorted by hand to ensure only the best reach your cup.',
    impact: 'This coffee supports infrastructure development in Embu, including road improvements that reduce transport costs for all farmers, a shared storage facility protecting harvests from moisture damage, and a mobile money system that ensures farmers receive payments quickly and securely.'
  },

  'Arabica Meru Ground': {
    intro: 'Sweet and aromatic Arabica from the highlands of Meru County, where the Batian variety thrives in volcanic soil. Processed using the honey method at 1750 meters, this coffee offers a silky body, balanced sweetness, and notes of honey, apricot, and brown sugar.',
    farmerBackground: 'Our Meru farmer is an innovator, among the first in the region to adopt the Batian variety and honey processing. Their experimental approach and attention to detail have resulted in award-winning coffees that showcase what\'s possible when tradition meets innovation.',
    farmDetails: {
      location: 'Meru County, eastern slopes of Mount Kenya',
      size: '3.2 hectares of carefully managed plantation',
      altitude: '1750 meters above sea level',
      practices: 'Precision agriculture using soil moisture sensors, integrated shade management with pruned macadamia trees, selective fertilization based on leaf analysis, and zero-waste processing where all byproducts are composted or used as livestock feed.'
    },
    processingJourney: 'The honey process gives these beans their signature sweetness. After pulping, a thin layer of mucilage is left on the beans during drying, caramelizing in the sun over 12-15 days. This labor-intensive method requires constant attention to prevent fermentation, but results in exceptional sweetness and body. Beans are then medium-roasted and ground to preserve their delicate flavors.',
    impact: 'Revenue from this coffee funds a revolving loan program for smallholder farmers in Meru, helping them invest in processing equipment, quality inputs, and farm improvements. It also supports a local vocational training center teaching agricultural skills to unemployed youth.'
  },

  'Batian Nyeri Premium': {
    intro: 'Premium Batian hybrid offering exceptional quality from the renowned coffee lands of Nyeri. Washed-processed at 1800 meters, this coffee delivers a smooth, complex cup with citrus brightness, hints of blackcurrant, and a clean, lingering finish that exemplifies why Kenyan coffee is treasured worldwide.',
    farmerBackground: 'With twenty-five years in coffee farming, our Nyeri producer is a respected leader in the local cooperative. They have mentored dozens of new farmers and pioneered quality improvements that have raised the reputation of coffee from their region.',
    farmDetails: {
      location: 'Nyeri County, prime coffee-growing zone of Central Kenya',
      size: '4.5 hectares of established coffee plantation',
      altitude: '1800 meters above sea level',
      practices: 'Certified Good Agricultural Practices (GAP), selective pruning cycles, integrated soil fertility management, water-efficient processing, and record-keeping systems that track every batch from tree to export.'
    },
    processingJourney: 'These beans undergo the classic Kenyan washed process at a cooperative factory known for quality. After pulping, beans are fermented for precisely 36 hours, washed clean, soaked overnight, and sun-dried on raised beds for 12 days. This meticulous process develops the bright acidity and clean flavor profile that Nyeri coffees are famous for.',
    impact: 'This premium coffee supports cooperative programs including a credit union offering affordable loans to members, a health insurance scheme covering 300 farming families, and agricultural extension services that provide free training and expert advice to all cooperative members.'
  },

  'SL28 Kirinyaga Peaberry': {
    intro: 'Rare peaberry beans from Kirinyaga\'s volcanic soils represent the pinnacle of specialty coffee. These unique beans - single, rounded instead of the usual two flat-sided - are hand-sorted from regular harvests. Washed-processed at 1650 meters, they offer concentrated flavor with chocolatey undertones and remarkable depth.',
    farmerBackground: 'Our Kirinyaga farmer has become known for producing exceptional peaberries, which occur naturally in about 5% of the harvest. They have developed special processing protocols to preserve the unique characteristics of these prized beans.',
    farmDetails: {
      location: 'Kirinyaga County, rich volcanic soils near Mount Kenya',
      size: '3 hectares of mature SL28 coffee trees',
      altitude: '1650 meters above sea level',
      practices: 'Old-tree conservation (some trees over 40 years old), minimal intervention farming, organic composting, hand-sorting at multiple stages to separate peaberries, and direct trade relationships ensuring fair premiums.'
    },
    processingJourney: 'Peaberries require special attention throughout processing. After selective hand-picking, they are pulped and fermented separately from regular beans. During drying, they are turned more frequently due to their rounded shape. Multiple rounds of hand-sorting ensure absolute consistency. The result is a rare coffee with concentrated sweetness and complexity.',
    impact: 'The premium prices for these rare beans allow the farmer to invest in farm improvements while maintaining a higher standard of living. A portion of proceeds funds a scholarship program for children from coffee-farming families to attend secondary school.'
  },

  'Ruiru 11 Kiambu Estate': {
    intro: 'Balanced Ruiru 11 from the cool Tigoni highlands of Kiambu County. Semi-washed processing at 1700 meters creates a coffee with low acidity, smooth body, and notes of nuts and dark chocolate. This approachable, consistent coffee is perfect for daily drinking.',
    farmerBackground: 'Operating a small estate for fifteen years, our Kiambu farmer has refined their methods to produce reliable, high-quality Ruiru 11. They are active in knowledge-sharing networks, regularly hosting farm visits for students and other farmers interested in sustainable coffee production.',
    farmDetails: {
      location: 'Kiambu County, Tigoni area known for cool temperatures',
      size: '5 hectares of estate coffee plantation',
      altitude: '1700 meters above sea level',
      practices: 'Estate management with permanent staff, mechanized mulching, drip irrigation during dry seasons, regular soil testing and amendment, and participation in Rainforest Alliance certification.'
    },
    processingJourney: 'The semi-washed process strikes a balance between washed and natural methods. Cherries are pulped, briefly fermented for 12 hours, then dried with some mucilage remaining. This creates a coffee with the body of natural processing and the cleanliness of washed, resulting in a smooth, balanced cup.',
    impact: 'This estate provides year-round employment for eight permanent workers and seasonal jobs for twenty pickers during harvest. It offers housing, healthcare benefits, and children\'s education support for all permanent staff. The estate also maintains a demo plot teaching intercropping techniques to neighboring smallholders.'
  },

  'Blue Mountain Embu Gold': {
    intro: 'The renowned Jamaican Blue Mountain variety, successfully adapted to Embu\'s high-altitude conditions. Pulped natural processing at 1850 meters produces a sweet, clean cup for specialty coffee lovers, with delicate flavors of nuts, mild citrus, and honey.',
    farmerBackground: 'A pioneer in cultivating Blue Mountain in Kenya, our Embu farmer obtained seedlings through a regional agricultural program and has spent years perfecting cultivation techniques for this demanding variety. Their success has inspired other farmers to experiment with specialty varieties.',
    farmDetails: {
      location: 'Embu County, highest elevations of the coffee-growing zone',
      size: '2 hectares of specialty coffee cultivation',
      altitude: '1850 meters above sea level',
      practices: 'Microclimate management for the temperature-sensitive variety, hand-weeding only, organic fertilization, extensive shade management, and detailed record-keeping of every growing decision and its outcome.'
    },
    processingJourney: 'The pulped natural method is perfect for this delicate variety. Cherries are pulped, then immediately dried with all mucilage intact. This preserves the bean\'s subtle flavors while adding slight sweetness. Drying takes place slowly over 14-16 days in controlled conditions. The result is a refined coffee with exceptional clarity.',
    impact: 'As a specialty coffee, Blue Mountain Gold commands premium prices that enable the farmer to invest in cutting-edge processing equipment, benefiting the entire community factory. Proceeds also support a local environmental conservation group protecting indigenous forests on Mount Kenya\'s slopes.'
  },

  "Arabica K7 Murang'a": {
    intro: 'Classic K7 varietal from Murang\'a County, one of Kenya\'s original coffee varieties. Semi-washed processing at 1650 meters brings out the variety\'s characteristic nutty aroma, smooth body, and gentle complexity. This is coffee with heritage - a taste of Kenya\'s coffee history.',
    farmerBackground: 'Our farmer maintains one of the last significant K7 plantations in Murang\'a, preserving this heirloom variety even as others switch to modern hybrids. Their dedication to traditional varieties helps maintain Kenya\'s coffee biodiversity and connects today\'s drinkers with the country\'s rich coffee heritage.',
    farmDetails: {
      location: 'Murang\'a County, traditional coffee-growing area',
      size: '3.5 hectares with 40-year-old K7 trees',
      altitude: '1650 meters above sea level',
      practices: 'Old-tree maintenance and rejuvenation pruning, organic farming certified for five years, heritage seed preservation, and mentoring programs teaching traditional coffee farming methods to interested youth.'
    },
    processingJourney: 'K7 beans are processed using traditional semi-washed methods that have been used in this region for generations. After pulping and brief fermentation, beans are partially washed and dried with some mucilage remaining. This time-tested process enhances body while maintaining clarity, perfectly suiting the K7\'s mellow character.',
    impact: 'This coffee supports heritage conservation efforts in Murang\'a, including a seed bank preserving heirloom coffee varieties, documentation of traditional farming knowledge, and cultural programs keeping coffee traditions alive for younger generations. It also funds a local museum dedicated to Kenya\'s coffee history.'
  },

  'Kent Meru Classic': {
    intro: 'Traditional Kent beans from shaded farms in Meru County deliver cocoa-rich sweetness and smooth body. Washed-processed at 1750 meters, this classic variety offers reliable, comforting flavors of dark chocolate, nuts, and subtle spice - perfect for those who appreciate traditional Kenyan coffee.',
    farmerBackground: 'Growing Kent variety for two decades, our Meru farmer has developed deep expertise in this classic variety. They are known for consistency and quality, supplying to the same cooperative year after year and mentoring newer farmers in traditional cultivation methods.',
    farmDetails: {
      location: 'Meru County, northeastern slopes of Mount Kenya',
      size: '4 hectares of mature Kent coffee trees',
      altitude: '1750 meters above sea level',
      practices: 'Traditional shade-growing under native trees, organic composting with coffee pulp and prunings, selective harvesting ensuring only ripe cherries, minimal chemical use, and water conservation through efficient processing.'
    },
    processingJourney: 'Kent beans are processed using the classic Kenyan washed method. After careful pulping, beans ferment for 24-30 hours to develop flavor, are washed thoroughly, soaked overnight for additional clarity, then sun-dried on raised beds for 10-12 days. This traditional approach brings out the variety\'s characteristic chocolate notes.',
    impact: 'Revenue supports the cooperative\'s social programs including a primary school serving 300 children, a health clinic offering subsidized care to farmers and their families, and a retirement fund for aging farmers who have served the cooperative for decades.'
  },

  'SL34 Kirinyaga Supreme': {
    intro: 'Premium SL34 beans bursting with red fruit and spice aromas create a vibrant, complex cup. Dark-roasted with natural processing at 1650 meters, this coffee offers bold intensity, wine-like body, and the distinctive character that makes Kenyan SL34 legendary among coffee connoisseurs.',
    farmerBackground: 'A specialist in SL34 cultivation, our Kirinyaga farmer has won regional quality competitions three times. They are meticulous about every stage of production, from selective picking to careful processing, ensuring their beans consistently rank among the finest in the region.',
    farmDetails: {
      location: 'Kirinyaga County, prime SL34 growing territory',
      size: '3.5 hectares of SL34 plantation',
      altitude: '1650 meters above sea level',
      practices: 'Precision agriculture with GPS mapping of individual trees, customized fertilization plans, disease monitoring and prevention, competition-grade cherry selection, and direct relationships with specialty roasters.'
    },
    processingJourney: 'Natural processing amplifies SL34\'s inherent fruitiness. Whole cherries are spread on raised beds and dried in the sun for 21-25 days, developing intense berry flavors. The beans are turned hourly during peak sun to ensure even drying. After hulling, beans are sorted rigorously, then dark-roasted to create bold complexity while preserving their distinctive character.',
    impact: 'As a competition-grade coffee, this product commands prices that enable significant community investment. Current projects include electrifying the local cooperative factory with solar power, building covered drying beds to improve quality in wet weather, and establishing a quality lab where farmers can cup and evaluate their coffees.'
  },

  'Batian Nyeri Espresso': {
    intro: 'Dark Batian roast crafted specifically for espresso lovers. Naturally processed at 1800 meters, these beans produce rich crema, full body, and deep flavors of dark chocolate and caramel. Perfect for straight espresso or as the base for milk-based drinks.',
    farmerBackground: 'Our Nyeri farmer works closely with specialty roasters to produce beans specifically for espresso. They have adapted their processing to enhance the characteristics espresso lovers seek: body, sweetness, and crema production, making them a sought-after supplier for Kenya\'s growing café culture.',
    farmDetails: {
      location: 'Nyeri County, premium coffee zone',
      size: '4 hectares dedicated to espresso-grade production',
      altitude: '1800 meters above sea level',
      practices: 'Targeted cultivation for espresso characteristics, extended fermentation for body development, controlled natural processing, and quality control protocols specifically for espresso roasting.'
    },
    processingJourney: 'These beans undergo extended natural processing to develop the body and sweetness perfect for espresso. Cherries dry on raised beds for 23-28 days, longer than standard processing, developing concentrated sugars and complex flavors. After hulling, beans are aged for 30 days before dark roasting, which develops the oils and compounds that create exceptional crema.',
    impact: 'This specialized coffee enables the farmer to diversify income and achieve premium prices. Proceeds support technical training for cooperative members in quality improvement, fund a cupping lab for evaluating samples, and provide scholarships for barista training to young people from farming families.'
  },

  'Arabica Embu Reserve': {
    intro: 'Limited reserve Arabica from Embu hills showcases the finest qualities of Kenyan coffee. Honey-processed SL28 at 1750 meters delivers caramel tones, smooth body, and elegant complexity. This is a coffee to savor slowly, appreciating the work of generations of dedicated farmers.',
    farmerBackground: 'Creating this reserve coffee is our Embu farmer\'s pride - it represents their best work each season. With thirty years of experience, they have perfected every detail from tree care to post-harvest handling, producing a coffee that stands among Kenya\'s finest.',
    farmDetails: {
      location: 'Embu County, select hillside plots with optimal exposure',
      size: '2.5 hectares of reserve-grade SL28',
      altitude: '1750 meters above sea level',
      practices: 'Tree-by-tree management with individual harvest plans, biodynamic farming principles, hand-sorting at every stage, limited production to maintain exclusivity, and long-term soil building for sustained quality.'
    },
    processingJourney: 'The honey process for this reserve coffee is executed with exceptional care. After pulping, beans are dried with maximum mucilage remaining, requiring expert monitoring to prevent over-fermentation. Drying proceeds slowly over 14-18 days with constant turning and protection from moisture. The result is a coffee with layers of flavor that reveal themselves as the cup cools.',
    impact: 'As a reserve coffee, this product supports the highest tier of quality production in Embu. Premium prices enable the farmer to maintain meticulous standards, invest in infrastructure like shade-drying structures and washing channels, and serve as a demonstration farm for quality-focused farming practices that benefit the entire community.'
  }
};

const addStories = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    console.log('📖 Adding stories to products...\n');

    let updatedCount = 0;

    for (const [productName, story] of Object.entries(productStories)) {
      const product = await Product.findOne({ name: productName });

      if (!product) {
        console.log(`⚠️  Product not found: ${productName}`);
        continue;
      }

      product.story = story;
      await product.save();

      console.log(`✅ Added story for: ${productName}`);
      updatedCount++;
    }

    console.log('\n🎉 Stories added successfully!');
    console.log(`📊 Total products updated: ${updatedCount}/${Object.keys(productStories).length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding stories:', error);
    process.exit(1);
  }
};

addStories();