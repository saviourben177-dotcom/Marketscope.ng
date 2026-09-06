"use client";

import { useState } from "react";
import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatNaira } from "@/lib/format";
import type { EntryAssistResult } from "@/entry-assist-types";

interface ProductOption {
  id: string;
  name: string;
  unit: string;
}
