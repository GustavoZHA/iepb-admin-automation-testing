import { ApiClient } from '../apiClient';
import { CreateMemberRequest, UpdateMemberCommandRequest, PagedRequest } from '../models/members.model';

export class MembersClient {
  constructor(private api: ApiClient) {}

  /**
   * GET /api/members - Retrieve all members
   */
  async getAll() {
    return this.api.get('/api/members');
  }

  /**
   * GET /api/members/{id} - Retrieve single member by ID
   */
  async getById(id: string) {
    return this.api.get(`/api/members/${id}`);
  }

  /**
   * POST /api/members - Create a new member
   */
  async create(payload: CreateMemberRequest) {
    return this.api.post('/api/members', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });
  }

  /**
   * PUT /api/members/{id} - Update existing member
   */
  async update(id: string, payload: UpdateMemberCommandRequest) {
    return this.api.put(`/api/members/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });
  }

  /**
   * DELETE /api/members/{id} - Delete member by ID
   */
  async delete(id: string) {
    return this.api.delete(`/api/members/${id}`);
  }

  /**
   * POST /api/members/search - Search members with pagination, filters and sorting
   */
  async search(payload: PagedRequest) {
    return this.api.post('/api/members/search', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });
  }

  /**
   * GET /api/members/lookups/relationship-types
   */
  async getRelationshipTypes() {
    return this.api.get('/api/members/lookups/relationship-types');
  }

  /**
   * GET /api/members/lookups/genders
   */
  async getGenders() {
    return this.api.get('/api/members/lookups/genders');
  }
}
