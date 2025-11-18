export const DELIVERY_COUNTIES = [
  "Nyeri",
  "Kiambu",
  "Kirinyaga",
  "Meru",
  "Murang'a",
  "Embu",
];

export const TOWNS_BY_COUNTY = {
  Nyeri: [
    "Nyeri Town",
    "Karatina",
    "Othaya",
    "Mukurweini",
    "Nanyuki",
  ],
  Kiambu: [
    "Thika",
    "Ruiru",
    "Juja",
    "Githunguri",
    "Limuru",
    "Kiambu Town",
  ],
  Kirinyaga: [
    "Kerugoya",
    "Kutus",
    "Sagana",
    "Kianyaga",
    "Kimbimbi / Wang’uru",
  ],
  "Meru": [
    "Meru Town",
    "Nkubu",
    "Maua",
    "Timau",
    "Miathene",
    "Mitunguu",
  ],
  "Murang'a": [
    "Murang’a Town",
    "Kenol",
    "Kangema",
    "Kandara",
    "Maragua",
  ],
  Embu: [
    "Embu Town",
    "Runyenjes",
    "Siakago",
    "Kiritiri",
  ],
};

export const ALL_TOWNS = Object.entries(TOWNS_BY_COUNTY).flatMap(
  ([county, towns]) =>
    towns.map((town) => ({
      county,
      town,
    }))
);
