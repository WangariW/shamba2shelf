
import nyeribeansImage from "../assets/images/roasted-beans-2.jpg";
import robustagroundImage from "../assets/images/ground-coffee.jpg";
import blendbeansImage from "../assets/images/blend-beans.jpeg";
import murangagroundImage from "../assets/images/arabica-muranga.jpg";
import embubeansImage from "../assets/images/robusta-beans.jpg";
import merugroundImage from "../assets/images/arabica-meru.jpg";

export const products = [
  {
    id: 1,
    name: "Arabica AA Nyeri Beans",
    type: "Arabica",
    form: "Beans",
    price: "KSh 1200/kg",
    image: nyeribeansImage,
    farmer: "Kamau Farm",
    county: "Nyeri",
    origin: "Grown in Nyeri’s cool, misty slopes known for floral aromas.",
    story: {
      intro: "Arabica beans nurtured in Nyeri’s fertile volcanic soils.",
      processingJourney: "Hand-picked, washed, and sun-dried to perfection.",
      impact: "Supports Nyeri’s smallholder farmers and promotes fair trade."
    }
  },
  {
    id: 2,
    name: "Robusta Kirinyaga Ground",
    type: "Robusta",
    form: "Ground Coffee",
    price: "KSh 1000/kg",
    image: robustagroundImage,
    farmer: "Wanjiru Estate",
    county: "Kirinyaga",
    origin: "Rich and bold from volcanic soils near Mt. Kenya.",
    story: {
      intro: "Bold Robusta beans from Kirinyaga’s lower slopes.",
      processingJourney: "Washed, roasted, and ground for deep body and aroma.",
      impact: "Empowers women-led cooperatives through fair compensation."
    }
  },
  {
    id: 3,
    name: "Blend Kiambu Beans",
    type: "Blend",
    form: "Beans",
    price: "KSh 1100/kg",
    image: blendbeansImage,
    farmer: "Gatundu Coffee Co.",
    county: "Kiambu",
    origin: "Balanced flavor from mixed Arabica varietals at 1700m.",
    story: {
      intro: "Smooth blend from Kiambu’s green hills.",
      processingJourney: "Processed naturally for a sweet and mellow taste.",
      impact: "Creates jobs for youth in coffee processing."
    }
  },
  {
    id: 4,
    name: "Arabica Murang’a Ground",
    type: "Arabica",
    form: "Ground Coffee",
    price: "KSh 1150/kg",
    image: murangagroundImage,
    farmer: "Nduta Farm",
    county: "Murang’a",
    origin: "Fruity cup grown along the Aberdare foothills.",
    story: {
      intro: "High-altitude Arabica from Murang’a’s fertile ridges.",
      processingJourney: "Sun-dried and roasted for bright, fruity flavor.",
      impact: "Encourages soil conservation and organic farming."
    }
  },
  {
    id: 5,
    name: "Robusta Embu Beans",
    type: "Robusta",
    form: "Beans",
    price: "KSh 950/kg",
    image: embubeansImage,
    farmer: "Gikundu Farm",
    county: "Embu",
    origin: "Earthy and strong, sun-dried on raised African beds.",
    story: {
      intro: "Earthy Robusta grown on Embu’s eastern ridges.",
      processingJourney: "Dried naturally to maintain intensity and body.",
      impact: "Supports local water-saving community projects."
    }
  },
  {
    id: 6,
    name: "Arabica Meru Ground",
    type: "Arabica",
    form: "Ground Coffee",
    price: "KSh 1180/kg",
    image: merugroundImage,
    farmer: "Muriuki Estate",
    county: "Meru",
    origin: "Bright acidity and caramel notes from Mt. Kenya slopes.",
    story: {
      intro: "Sweet, aromatic Arabica from Meru’s highlands.",
      processingJourney: "Honey-processed for a silky, balanced cup.",
      impact: "Supports local women’s coffee cooperatives."
    }
  },
  {
    id: 7,
    name: "Batian Nyeri Premium",
    type: "Arabica",
    form: "Beans",
    price: "KSh 1250/kg",
    image: nyeribeansImage,
    farmer: "Karimi Family Farm",
    county: "Nyeri",
    origin: "A newer Kenyan hybrid, smooth with citrus finish.",
    story: {
      intro: "Premium Batian hybrid offering smooth, citrusy notes.",
      processingJourney: "Wet-processed and carefully sun-dried.",
      impact: "Helps farmers adapt to climate-resilient coffee strains."
    }
  },
  {
    id: 8,
    name: "SL28 Kirinyaga Peaberry",
    type: "Arabica",
    form: "Beans",
    price: "KSh 1300/kg",
    image: robustagroundImage,
    farmer: "Muthee Hills Farm",
    county: "Kirinyaga",
    origin: "Peaberry beans with deep chocolate undertones.",
    story: {
      intro: "Rare peaberries from Kirinyaga’s volcanic soils.",
      processingJourney: "Washed and medium-roasted for smooth chocolatey flavor.",
      impact: "Improves livelihoods via direct farm-to-buyer sales."
    }
  },
  {
    id: 9,
    name: "Ruiru 11 Kiambu Estate",
    type: "Arabica",
    form: "Ground Coffee",
    price: "KSh 1120/kg",
    image: blendbeansImage,
    farmer: "Tigoni Highlands Estate",
    county: "Kiambu",
    origin: "Low-caffeine hybrid grown under macadamia shade.",
    story: {
      intro: "Balanced Ruiru 11 from the cool Tigoni highlands.",
      processingJourney: "Wet-processed and roasted for low acidity.",
      impact: "Promotes intercropping with macadamia for soil health."
    }
  },
  {
    id: 10,
    name: "Blue Mountain Embu Gold",
    type: "Arabica",
    form: "Beans",
    price: "KSh 1400/kg",
    image: embubeansImage,
    farmer: "Kanyeki Farm",
    county: "Embu",
    origin: "Jamaican variety thriving in Embu’s rich loam soils.",
    story: {
      intro: "Jamaican Blue Mountain grown locally in Embu.",
      processingJourney: "Double-washed and roasted to preserve sweetness.",
      impact: "Creates opportunities for specialty coffee exports."
    }
  },
  {
    id: 11,
    name: "Arabica K7 Murang’a",
    type: "Arabica",
    form: "Ground Coffee",
    price: "KSh 1160/kg",
    image: murangagroundImage,
    farmer: "Muthoni Estate",
    county: "Murang’a",
    origin: "Nutty and floral, cultivated on terraced hillsides.",
    story: {
      intro: "Classic K7 varietal with nutty aroma and smooth body.",
      processingJourney: "Semi-washed and roasted for a balanced finish.",
      impact: "Preserves heritage coffee varieties in Murang’a."
    }
  },
  {
    id: 12,
    name: "Kent Meru Classic",
    type: "Arabica",
    form: "Beans",
    price: "KSh 1200/kg",
    image: merugroundImage,
    farmer: "Nthiga Farm",
    county: "Meru",
    origin: "Traditional Kent varietal with cocoa sweetness.",
    story: {
      intro: "Traditional Kent beans from Nthiga’s shaded farms.",
      processingJourney: "Sun-dried and roasted for cocoa-rich sweetness.",
      impact: "Revives old coffee varietals in modern farming."
    }
  },
  {
    id: 13,
    name: "SL34 Kirinyaga Supreme",
    type: "Arabica",
    form: "Ground Coffee",
    price: "KSh 1280/kg",
    image: robustagroundImage,
    farmer: "Wangari Wet Mill",
    county: "Kirinyaga",
    origin: "Full-bodied cup with red fruit and spice aroma.",
    story: {
      intro: "Premium SL34 with red fruit and spice aroma.",
      processingJourney: "Wet-processed to preserve vibrant flavor.",
      impact: "Funds education for farmers’ children."
    }
  },
  {
    id: 14,
    name: "Batian Nyeri Espresso",
    type: "Arabica",
    form: "Ground Coffee",
    price: "KSh 1250/kg",
    image: nyeribeansImage,
    farmer: "Kamau Farm",
    county: "Nyeri",
    origin: "Roasted darker for smooth espresso lovers.",
    story: {
      intro: "Dark Batian roast crafted for espresso fans.",
      processingJourney: "Double-roasted for a rich crema.",
      impact: "Supports small roasters in Nyeri."
    }
  },
  {
    id: 15,
    name: "Arabica Embu Reserve",
    type: "Arabica",
    form: "Beans",
    price: "KSh 1190/kg",
    image: embubeansImage,
    farmer: "Njeri Family Farm",
    county: "Embu",
    origin: "Handpicked microlot with honey sweetness and smooth body.",
    story: {
      intro: "Limited reserve Arabica from Embu hills.",
      processingJourney: "Honey-processed to highlight caramel tones.",
      impact: "Strengthens direct-trade partnerships with buyers."
    }
  }
];
