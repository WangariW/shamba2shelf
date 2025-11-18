import { useState, useEffect } from "react";
import { DELIVERY_COUNTIES, TOWNS_BY_COUNTY } from "../config/deliveryRegions";

export default function FarmerLocationForm({ value, onChange }) {
  const [form, setForm] = useState({
    county: value?.county || "",
    town: value?.town || "",
  });

  useEffect(() => {
    onChange?.(form);
  }, [form, onChange]);

  const handleCountyChange = (e) => {
    const county = e.target.value;
    setForm((prev) => ({
      ...prev,
      county,
      town: "", // clear town when county changes
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

    </div>
  );
}
