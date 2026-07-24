import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

interface GitHubUserResponse {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  profileUrl: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitterUsername: string | null;
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class UserService {
  private readonly githubApiBaseUrl = 'https://api.github.com';

  async getUserProfile(username: string): Promise<UserProfile> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'fast_test-app',
    };

    const token = process.env.GITHUB_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${this.githubApiBaseUrl}/users/${encodeURIComponent(username)}`,
      { headers },
    );

    if (response.status === 404) {
      throw new NotFoundException(`GitHub user "${username}" not found`);
    }

    if (response.status === 403) {
      const errorBody = (await response.json()) as { message?: string };
      if (errorBody.message?.includes('rate limit')) {
        throw new HttpException(
          'github rate limit exceeded',
          429,
        );
      }
    }

    if (!response.ok) {
      throw new InternalServerErrorException(
        'failed to fetch user data from GitHub',
      );
    }

    const data = (await response.json()) as GitHubUserResponse;

    return {
      username: data.login,
      name: data.name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      profileUrl: data.html_url,
      location: data.location,
      company: data.company,
      blog: data.blog,
      twitterUsername: data.twitter_username,
      publicRepos: data.public_repos,
      publicGists: data.public_gists,
      followers: data.followers,
      following: data.following,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
