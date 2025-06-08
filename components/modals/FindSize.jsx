import React from "react";
import Image from "next/image";

export default function FindSize() {
  return (
    <div className="modal fade modalDemo tf-product-modal" id="find_size">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title">Size Chart</div>
            <span className="icon-close icon-close-popup" data-bs-dismiss="modal" />
          </div>
          <div className="tf-rte">
            <div className="tf-table-res-df">
              <h6>Adult Size Guide</h6>
              <table className="tf-sizeguide-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>US</th>
                    <th>Bust (in)</th>
                    <th>Waist (in)</th>
                    <th>Hip (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>XS</td><td>2</td><td>32</td><td>24 - 25</td><td>33 - 34</td></tr>
                  <tr><td>S</td><td>4</td><td>34 - 35</td><td>26 - 27</td><td>35 - 36</td></tr>
                  <tr><td>M</td><td>6</td><td>36 - 37</td><td>28 - 29</td><td>38 - 40</td></tr>
                  <tr><td>L</td><td>8</td><td>38 - 39</td><td>30 - 31</td><td>42 - 44</td></tr>
                  <tr><td>XL</td><td>10</td><td>40 - 41</td><td>32 - 33</td><td>45 - 47</td></tr>
                  <tr><td>XXL</td><td>12</td><td>42 - 43</td><td>34 - 35</td><td>48 - 50</td></tr>
                </tbody>
              </table>

              <h6 className="mt-4">Baby Size Guide</h6>
              <table className="tf-sizeguide-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Age</th>
                    <th>Height (in)</th>
                    <th>Weight (lbs)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>NB</td><td>0–3 Months</td><td>17–23</td><td>7–12</td></tr>
                  <tr><td>3M</td><td>3–6 Months</td><td>24–26</td><td>12–17</td></tr>
                  <tr><td>6M</td><td>6–9 Months</td><td>27–28</td><td>17–20</td></tr>
                  <tr><td>9M</td><td>9–12 Months</td><td>28–30</td><td>20–22</td></tr>
                  <tr><td>12M</td><td>12–15 Months</td><td>30–31</td><td>22–24</td></tr>
                  <tr><td>18M</td><td>15–18 Months</td><td>32–33</td><td>24–27</td></tr>
                  <tr><td>24M</td><td>18–24 Months</td><td>33–35</td><td>27–30</td></tr>
                </tbody>
              </table>

              <h6 className="mt-4">Kids Size Guide</h6>
              <table className="tf-sizeguide-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Age</th>
                    <th>Height (in)</th>
                    <th>Weight (lbs)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>2T</td><td>2–3 Years</td><td>35–38</td><td>28–30</td></tr>
                  <tr><td>3T</td><td>3–4 Years</td><td>38–40</td><td>30–33</td></tr>
                  <tr><td>4T</td><td>4–5 Years</td><td>40–42</td><td>33–36</td></tr>
                  <tr><td>5</td><td>5–6 Years</td><td>42–45</td><td>37–42</td></tr>
                  <tr><td>6–7</td><td>6–7 Years</td><td>45–48</td><td>43–48</td></tr>
                  <tr><td>7–8</td><td>7–8 Years</td><td>48–50</td><td>49–54</td></tr>
                  <tr><td>8–10</td><td>8–10 Years</td><td>50–54</td><td>55–70</td></tr>
                  <tr><td>10–12</td><td>10–12 Years</td><td>54–58</td><td>71–90</td></tr>
                  <tr><td>12–14</td><td>12–14 Years</td><td>58–62</td><td>90–110</td></tr>
                </tbody>
              </table>
            </div>

            <div className="tf-page-size-chart-content">
              <div>
                <h6>Measuring Tips</h6>
                <div className="title">Bust / Chest</div>
                <p>Measure around the fullest part of the bust/chest.</p>
                <div className="title">Waist</div>
                <p>Measure around the natural waistline.</p>
                <div className="title">Hips</div>
                <p className="mb-0">Measure around the fullest part of the hips.</p>
              </div>
              <div>
                <Image
                  className="sizechart lazyload"
                  data-src="/images/shop/products/size_chart2.jpg"
                  alt="Size Chart"
                  src="/images/shop/products/size_chart2.jpg"
                  width={290}
                  height={290}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
