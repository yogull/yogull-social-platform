/**
 * Copyright (c) 2025 John Proctor. All rights reserved.
 * The People's Health Community Platform
 * Unauthorized copying, distribution, or modification is strictly prohibited.
 */

import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TranslationProvider } from "@/hooks/useTranslation";
import { SupportBanner } from "@/components/SupportBanner";
import { CookieConsent } from "@/components/CookieConsent";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Footer } from "@/components/Footer";
import { SEOBooster, usePageSpeed } from "@/components/SEOBooster";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AdvancedSEO, CoreWebVitalsOptimizer } from "@/components/AdvancedSEO";
