import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MatchScoreStorageService {
  private matchScoreResponse: any = null;

  // Method to set MatchScore response data
  setMatchScoreResponse(data: any) {
    this.matchScoreResponse = data;
  }

  // Method to get MatchScore response data
  getMatchScoreResponse() {
    return this.matchScoreResponse;
  }
}
