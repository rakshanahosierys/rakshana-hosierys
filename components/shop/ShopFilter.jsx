// components/ShopFilter.jsx
'use client';

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/utlis/firebaseConfig";
import Slider from 'rc-slider';
import { useRouter } from 'next/navigation'; // <--- IMPORT THIS

const ShopFilter = forwardRef(({ products, setFinalSorted, initialFilterCategoryName }, ref) => {
  const router = useRouter(); // <--- INITIALIZE THE ROUTER

  const [price, setPrice] = useState([200, 4000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedAvailabilities, setSelectedAvailabilities] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [isNewArrivalChecked, setIsNewArrivalChecked] = useState(false);

  const [filterMetadata, setFilterMetadata] = useState({
    sizes: [],
    brands: [],
    colors: [],
    categories: []
  });

  useImperativeHandle(ref, () => ({
    clearFilter,
  }));

  const availabilities = [
    { id: 1, isAvailable: true, text: 'Available' },
    { id: 2, isAvailable: false, text: 'Out of Stock' },
  ];

  useEffect(() => {
    const fetchMetadata = async () => {
      const docRef = doc(db, 'metadata', 'productFilters');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFilterMetadata(docSnap.data());
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (initialFilterCategoryName) {
      const lowerCaseFilter = initialFilterCategoryName.toLowerCase();

      if (lowerCaseFilter === 'new arrivals') {
        setIsNewArrivalChecked(true);
        setSelectedCategories([]);
      } else if (filterMetadata.categories.length > 0) {
        const matchedCategory = filterMetadata.categories.find(
          (cat) => cat.name.toLowerCase() === lowerCaseFilter
        );
        if (matchedCategory) {
          setSelectedCategories([matchedCategory.id]);
          setIsNewArrivalChecked(false);
        }
      }
    }
  }, [initialFilterCategoryName, filterMetadata.categories]);


  const handlePrice = (value) => setPrice(value);
  const handleToggle = (value, setState) => {
    setState((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  useEffect(() => {
    let filteredArrays = [
      products.filter((p) => p.price >= price[0] && p.price <= price[1])
    ];

    if (selectedCategories.length)
      filteredArrays.push(
        products.filter((p) =>
          p.categories?.some((cat) => selectedCategories.includes(cat.id))
        )
      );

    if (isNewArrivalChecked)
      filteredArrays.push(products.filter((p) => p.isNewArrival === true));

    if (selectedColors.length)
      filteredArrays.push(
        products.filter((p) =>
          p.colors?.map((c) => c.name).some((c) => selectedColors.includes(c))
        )
      );

    if (selectedBrands.length)
      filteredArrays.push(products.filter((p) => selectedBrands.includes(p.brand)));

    if (selectedSizes.length)
      filteredArrays.push(products.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s))
      ));

    if (selectedAvailabilities.length)
      filteredArrays.push(
        products.filter((p) =>
          selectedAvailabilities
            .map((a) => a.isAvailable)
            .includes(p.isAvailable)
        )
      );

    const common = products.filter((p) =>
      filteredArrays.every((arr) => arr.includes(p))
    );

    setFinalSorted(common);
  }, [price, selectedCategories, selectedColors, selectedBrands, selectedAvailabilities, selectedSizes, products, isNewArrivalChecked]);

  // --- MODIFIED clearFilter function ---
  const clearFilter = () => {
    // Reset all internal states
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setSelectedAvailabilities([]);
    setSelectedSizes([]);
    setPrice([200, 4000]);
    setIsNewArrivalChecked(false);

    router.push('/shop-default'); // <--- CHANGE THIS LINE
  };
  // --- END MODIFIED clearFilter ---

  return (
    // ... (your existing JSX) ...
    <div className="offcanvas offcanvas-start canvas-filter" id="filterShop">
      <div className="canvas-wrapper">
        <header className="canvas-header">
          <div className="filter-icon">
            <span className="icon icon-filter" />
            <span>Filter</span>
          </div>
          <span className="icon-close icon-close-popup" data-bs-dismiss="offcanvas" />
        </header>
        <div className="canvas-body">
          {/* Category Filter */}
          <div className="widget-facet wd-categories">
            <div className="facet-title" data-bs-toggle="collapse" data-bs-target="#category">
              <span>Category</span>
              <span className="icon icon-arrow-up" />
            </div>
            <div id="category" className="collapse show">
              <ul className="list-categoris current-scrollbar mb_36">
                {filterMetadata.categories.map((cat) => (
                  <li key={cat.id} className="list-item d-flex gap-12 align-items-center" onClick={() => handleToggle(cat.id, setSelectedCategories)}>
                    <input type="checkbox" readOnly checked={selectedCategories.includes(cat.id)} />
                    <label>
                      {cat.name} ({products.filter((p) => p.categories?.some((c) => c.id === cat.id)).length})
                    </label>
                  </li>
                ))}
                <li className="list-item d-flex gap-12 align-items-center" onClick={() => setIsNewArrivalChecked(!isNewArrivalChecked)}>
                  <input type="checkbox" readOnly checked={isNewArrivalChecked} />
                  <label>
                    New Arrivals ({products.filter((p) => p.isNewArrival).length})
                  </label>
                </li>
              </ul>
            </div>
          </div>
          {/* ... Rest of your ShopFilter JSX (Availability, Price, Brand, Color, Size, Clear Button) ... */}
          <div className="widget-facet">
            <div className="facet-title" data-bs-toggle="collapse" data-bs-target="#availability">
              <span>Availability</span>
              <span className="icon icon-arrow-up" />
            </div>
            <div id="availability" className="collapse show">
              <ul className="tf-filter-group current-scrollbar mb_36">
                {availabilities.map((a) => (
                  <li key={a.id} className="list-item d-flex gap-12 align-items-center" onClick={() => setSelectedAvailabilities([a])}>
                    <input
                      type="radio"
                      name="availability"
                      readOnly
                      checked={selectedAvailabilities.some((v) => v.id === a.id)}
                    />
                    <label>
                      {a.text} ({products.filter((p) => p.isAvailable === a.isAvailable).length})
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="widget-facet wrap-price">
            <div className="facet-title" data-bs-toggle="collapse" data-bs-target="#price">
              <span>Price</span>
              <span className="icon icon-arrow-up" />
            </div>
            <div id="price" className="collapse show">
              <div className="widget-price filter-price">
                <Slider allowCross={false} range min={200} max={4000} value={price} onChange={handlePrice} />
                <div className="box-title-price">
                  <span className="title-price">Price :</span>
                  <div className="caption-price">
                    <div>
                      <span>₹</span>
                      <span className="min-price">{price[0]}</span>
                    </div>
                    <span>-</span>
                    <div>
                      <span>₹</span>
                      <span className="max-price">{price[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="widget-facet">
            <div className="facet-title" data-bs-toggle="collapse" data-bs-target="#brand">
              <span>Brand</span>
              <span className="icon icon-arrow-up" />
            </div>
            <div id="brand" className="collapse show">
              <ul className="tf-filter-group current-scrollbar mb_36">
                {filterMetadata.brands.map((brand) => (
                  <li key={brand} className="list-item d-flex gap-12 align-items-center" onClick={() => handleToggle(brand, setSelectedBrands)}>
                    <input type="checkbox" readOnly checked={selectedBrands.includes(brand)} />
                    <label>
                      {brand} ({products.filter((p) => p.brand === brand).length})
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="widget-facet">
            <div className="facet-title" data-bs-toggle="collapse" data-bs-target="#color">
              <span>Color</span>
              <span className="icon icon-arrow-up" />
            </div>
            <div id="color" className="collapse show">
              <ul className="tf-filter-group filter-color current-scrollbar mb_36">
                {filterMetadata.colors.map((color, i) => (
                  <li key={i} className="list-item d-flex gap-12 align-items-center" onClick={() => handleToggle(color.name, setSelectedColors)}>
                    <input type="checkbox" readOnly checked={selectedColors.includes(color.name)} />
                    <span className={`circle-swatch swatch-value ${color.colorClass}`} />
                    <label>
                      {color.name} ({products.filter((p) => p.colors?.map(c => c.name).includes(color.name)).length})
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="widget-facet">
            <div className="facet-title" data-bs-toggle="collapse" data-bs-target="#size">
              <span>Size</span>
              <span className="icon icon-arrow-up" />
            </div>
            <div id="size" className="collapse show">
              <ul className="tf-filter-group current-scrollbar">
                {filterMetadata.sizes.map((size, i) => (
                  <li key={i} className="list-item d-flex gap-12 align-items-center" onClick={() => handleToggle(size, setSelectedSizes)}>
                    <input type="checkbox" readOnly checked={selectedSizes.includes(size)} />
                    <label>
                      {size} ({products.filter((p) => p.sizes?.includes(size)).length})
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <a className="tf-btn style-2 btn-fill rounded animate-hover-btn" onClick={clearFilter}>Clear Filter</a>
        </div>
      </div>
    </div>
  );
});

export default ShopFilter;