import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate } from "k6/metrics";

export const options = {
  vus: 2000,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    purchase_success: ["count<=1000"],
  },
};

const purchaseSuccess = new Counter("purchase_success");
const purchaseSoldOut = new Counter("purchase_sold_out");
const purchaseAlreadyBought = new Counter("purchase_already_bought");
const errorRate = new Rate("error_rate");

export default function () {
  const userId = `user_${__VU}`;

  const res = http.post(
    "http://localhost:3000/purchase",
    JSON.stringify({ userId }),
    {
      headers: { "Content-Type": "application/json" },
      responseCallback: http.expectedStatuses(201, 409, 410),
    }
  );

  const ok = check(res, {
    "status is 201, 409, or 410": (r) =>
      r.status === 201 || r.status === 409 || r.status === 410,
    "no 5xx errors": (r) => r.status < 500,
  });

  errorRate.add(!ok);

  if (res.status === 201) purchaseSuccess.add(1);
  else if (res.status === 410) purchaseSoldOut.add(1);
  else if (res.status === 409) purchaseAlreadyBought.add(1);

  sleep(0.01);
}
