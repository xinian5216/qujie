import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { GeoResult } from "./types";

const Input = z.object({
  extraIps: z.array(z.string()).max(4).optional(),
});

export const inspectGeo = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const parsed = Input.safeParse(data ?? {});
    return parsed.success ? parsed.data : { extraIps: [] as string[] };
  })
  .handler(async ({ data }): Promise<GeoResult> => {
    const { collectGeo } = await import("./inspect-geo.server");
    return collectGeo(data.extraIps ?? []);
  });
