import { ApiClient } from '../apiClient';

export class LookupsClient {
  constructor(private api: ApiClient) {}

  async getMaritalStatuses() {
    return this.api.get('/api/lookups/marital-statuses');
  }

  async getSpiritualLevels() {
    return this.api.get('/api/lookups/spiritual-levels');
  }

  async getMembershipStatuses() {
    return this.api.get('/api/lookups/membership-statuses');
  }

  async getEventTypes() {
    return this.api.get('/api/lookups/event-types');
  }
}
