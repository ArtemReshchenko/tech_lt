import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const responseTime = new Trend('response_time', true);

export const options = {
    scenarios: {
        load_test: {
            executor: 'constant-vus',
            vus: 100,
            duration: '2m',
        },
    },
    thresholds: {
        http_req_duration: [
            'p(50)<300',
            'p(95)<500',
            'p(99)<1000',
        ],
        errors: ['rate<0.01'],
        http_reqs: ['rate>50'],
    },
};

const API_KEY = __ENV.REQRES_API_KEY || '';

export default function () {
    const url = 'https://reqres.in/api/users?page=1';
    const params = {
        headers: {
            'x-api-key': API_KEY,
        },
    };
    const res = http.get(url, params);
    responseTime.add(res.timings.duration);

    const success = check(res, {
        'status is 200': (r) => r.status === 200,
        'response body has data': (r) => {
            try {
                const body = r.json();
                return body.data !== undefined && body.data.length > 0;
            } catch (e) {
                return false;
            }
        },
        'response time < 500ms': (r) => r.timings.duration < 500,
    });

    errorRate.add(!success);
    sleep(1);
}
