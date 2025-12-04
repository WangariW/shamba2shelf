import { useState, useEffect } from "react";
import { DELIVERY_COUNTIES, TOWNS_BY_COUNTY } from "../config/deliveryRegions";

export default function FarmerLocationForm({ value, onChange }) {
  const [form, setForm] = useState({
    county: value?.county || "",
    town: value?.town || "",
    pickupPoint: value?.pickupPoint || "",
  });

  useEffect(() => {
    onChange?.(form);
  }, [form, onChange]);

  const handleCountyChange = (e) => {
    const county = e.target.value;
    setForm((prev) => ({
      ...prev,
      county,
      town: "", 
    }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">

      {/* COUNTY */}
      <div>
        <label className="block text-sm font-medium mb-1">County</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={form.county}
          onChange={handleCountyChange}
        >
          <option value="">Select county</option>
          {DELIVERY_COUNTIES.map((county) => (
            <option key={county} value={county}>
              {county}
            </option>
          ))}
        </select>
      </div>

      {/* TOWN */}
      <div>
        <label className="block text-sm font-medium mb-1">Town</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={form.town}
          onChange={(e) => handleChange("town", e.target.value)}
          disabled={!form.county}
        >
          <option value="">Select town</option>
          {form.county &&
            TOWNS_BY_COUNTY[form.county]?.map((town) => (
              <option key={town} value={town}>
                {town}
              </option>
            ))}
        </select>
      </div>

      {/*Pickup Point */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Pickup Point (Optional)
          </label>
        <input
          type="text"
          className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-[#2a2520] text-gray-800 dark:text-gray-200"
          value={form.pickupPoint}
          onChange={(e) => handleChange("pickupPoint", e.target.value)}
          placeholder="Enter pickup point"
        />
        <p className="text-xs text-gray-500 mt-1">
          Provide a nearby landmark or specific location for easier pickup.
        </p>
      </div>

    </div>
  );
}
