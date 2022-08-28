import { RouteBases } from "@discloudapp/api-types/v2";
import { filesystem, http } from "gluegun";

export const apidiscloud = http.create({
  baseURL: RouteBases.api,
  headers: {
    "api-token": filesystem.read(`${filesystem.homedir()}/.discloud/api`)
  }
});