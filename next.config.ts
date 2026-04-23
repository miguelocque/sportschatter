import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

    // allows us to use styled components for Server Side Rendering
    compiler: {
        styledComponents: true,
    },
};

export default nextConfig;
