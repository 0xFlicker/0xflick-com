export interface IRole {
  id: string;
  name: string;
}

export class RoleModel {
  public id: string;
  public name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  public static fromJson(json: any): RoleModel {
    return new RoleModel(json.id, json.name);
  }

  public toJson(): any {
    return {
      id: this.id,
      name: this.name,
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJson());
  }

  public equals(other: RoleModel): boolean {
    return this.id === other.id && this.name === other.name;
  }

  public clone(): RoleModel {
    return new RoleModel(this.id, this.name);
  }
}

export interface IRoleListResponseSuccess {
  items: IRole[];
  count: number;
  page: number;
  cursor?: string;
}
