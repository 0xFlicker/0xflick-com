export interface IUrlShortener {
  readonly url: string;
  readonly hash: string;
}

export class UrlShortenerModel {
  readonly url: string;
  readonly hash: string;

  constructor({ url, hash }: IUrlShortener) {
    this.url = url;
    this.hash = hash;
  }

  public toJSON(): IUrlShortener {
    return {
      url: this.url,
      hash: this.hash,
    };
  }

  public static fromJSON(json: IUrlShortener): UrlShortenerModel {
    return new UrlShortenerModel(json);
  }
}
