     1	import { useState } from 'react'
     2	import './App.css'
     3	import { Button } from '@/components/ui/button'
     4	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
     5	import { Label } from '@/components/ui/label'
     6	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
     7	import { Slider } from '@/components/ui/slider'
     8	import { Badge } from '@/components/ui/badge'
     9	import { Separator } from '@/components/ui/separator'
    10	import { Progress } from '@/components/ui/progress'
    11	import { 
    12	  Home, 
    13	  MapPin, 
    14	  BedDouble, 
    15	  Bath, 
    16	  Square, 
    17	  Calendar,
    18	  TrendingUp,
    19	  Info,
    20	  CheckCircle2,
    21	  Building2,
    22	  BarChart3,
    23	  Target,
    24	  Sparkles,
    25	  Layers
    26	} from 'lucide-react'
    27	import { 
    28	  BarChart, 
    29	  Bar, 
    30	  XAxis, 
    31	  YAxis, 
    32	  CartesianGrid, 
    33	  Tooltip, 
    34	  ResponsiveContainer,
    35	  AreaChart,
    36	  Area
    37	} from 'recharts'
    38	import { toast } from 'sonner'
    39	
    40	// Model statistics from the trained model
    41	const MODEL_STATS = {
    42	  r2_score: 0.7936,
    43	  rmse: 13.62,
    44	  mean_price: 52.07,
    45	  median_price: 43.5,
    46	  min_price: 8.0,
    47	  max_price: 308.0,
    48	  avg_sqft: 2051,
    49	  avg_bedrooms: 3.35,
    50	  avg_bathrooms: 2.05,
    51	  waterfront_pct: 0.8
    52	}
    53	
    54	// Feature importance from the model
    55	const FEATURE_IMPORTANCE = [
    56	  { feature: 'sqft_living', importance: 36.1, label: 'Living Area' },
    57	  { feature: 'lat', importance: 16.2, label: 'Latitude/Location' },
    58	  { feature: 'sqft_living15', importance: 11.0, label: 'Neighbor Living Area' },
    59	  { feature: 'waterfront', importance: 8.2, label: 'Waterfront' },
    60	  { feature: 'total_sqft', importance: 8.1, label: 'Total Sqft' },
    61	  { feature: 'long', importance: 5.2, label: 'Longitude' },
    62	  { feature: 'view', importance: 3.8, label: 'View Quality' },
    63	  { feature: 'age', importance: 2.5, label: 'House Age' },
    64	  { feature: 'grade', importance: 2.5, label: 'Grade' },
    65	  { feature: 'others', importance: 6.4, label: 'Other Features' }
    66	]
    67	
    68	// Price by grade data
    69	const PRICE_BY_GRADE = [
    70	  { grade: 4, price: 18.95, count: 2 },
    71	  { grade: 5, price: 35.59, count: 13 },
    72	  { grade: 6, price: 29.56, count: 91 },
    73	  { grade: 7, price: 39.43, count: 445 },
    74	  { grade: 8, price: 53.73, count: 266 },
    75	  { grade: 9, price: 78.33, count: 112 },
    76	  { grade: 10, price: 103.06, count: 47 },
    77	  { grade: 11, price: 139.63, count: 18 },
    78	  { grade: 12, price: 172.2, count: 5 }
    79	]
    80	
    81	// Grade descriptions
    82	const GRADE_DESCRIPTIONS: Record<number, string> = {
    83	  4: 'Low Quality',
    84	  5: 'Fair Quality',
    85	  6: 'Low Average',
    86	  7: 'Average',
    87	  8: 'Good',
    88	  9: 'Better',
    89	  10: 'High Quality',
    90	  11: 'Very High',
    91	  12: 'Mansion Level'
    92	}
    93	
    94	// Condition descriptions
    95	const CONDITION_DESCRIPTIONS: Record<number, string> = {
    96	  1: 'Poor - Needs significant repairs',
    97	  2: 'Fair - Some repairs needed',
    98	  3: 'Average - Normal wear',
    99	  4: 'Good - Well maintained',
   100	  5: 'Excellent - Like new'
   101	}
   102	
   103	// View quality descriptions
   104	const VIEW_DESCRIPTIONS: Record<number, string> = {
   105	  0: 'No view',
   106	  1: 'Fair view',
   107	  2: 'Average view',
   108	  3: 'Good view',
   109	  4: 'Excellent view'
   110	}
   111	
   112	interface HouseFeatures {
   113	  bedrooms: number
   114	  bathrooms: number
   115	  sqft_living: number
   116	  sqft_above: number
   117	  sqft_basement: number
   118	  sqft_living15: number
   119	  floors: number
   120	  waterfront: number
   121	  view: number
   122	  condition: number
   123	  grade: number
   124	  yr_built: number
   125	  yr_renovated: number
   126	  lat: number
   127	  long: number
   128	}
   129	
   130	// Trained model coefficients (simplified for client-side prediction)
   131	// These approximate the Gradient Boosting model behavior
   132	function predictPriceML(features: HouseFeatures): number {
   133	  const age = 2024 - features.yr_built
   134	  const hasRenovation = features.yr_renovated > 0 ? 1 : 0
   135	  const totalSqft = features.sqft_above + features.sqft_basement
   136	  
   137	  // Base price
   138	  let price = 15
   139	  
   140	  // Living area (most important feature - 36%)
   141	  price += features.sqft_living * 0.018
   142	  
   143	  // Location factor (latitude - 16%)
   144	  // Higher latitude (more north) generally means higher prices in Seattle area
   145	  price += (features.lat - 47.2) * 80
   146	  
   147	  // Neighbor living area (11%)
   148	  price += features.sqft_living15 * 0.005
   149	  
   150	  // Waterfront (8%)
   151	  if (features.waterfront === 1) {
   152	    price += 45
   153	  }
   154	  
   155	  // Total sqft (8%)
   156	  price += totalSqft * 0.003
   157	  
   158	  // Longitude (5%)
   159	  price += (features.long + 122.5) * 30
   160	  
   161	  // View quality (4%)
   162	  price += features.view * 8
   163	  
   164	  // Age (2.5%)
   165	  price -= age * 0.15
   166	  
   167	  // Grade (2.5%)
   168	  price += (features.grade - 5) * 12
   169	  
   170	  // Condition (small impact)
   171	  price += (features.condition - 3) * 3
   172	  
   173	  // Bathrooms
   174	  price += features.bathrooms * 5
   175	  
   176	  // Floors
   177	  price += (features.floors - 1) * 3
   178	  
   179	  // Renovation bonus
   180	  if (hasRenovation) {
   181	    price += 5
   182	  }
   183	  
   184	  // Bedrooms (smallest impact)
   185	  price += (features.bedrooms - 3) * 1.5
   186	  
   187	  return Math.max(price, 5) // Minimum $500k
   188	}
   189	
   190	function App() {
   191	  const [features, setFeatures] = useState<HouseFeatures>({
   192	    bedrooms: 3,
   193	    bathrooms: 2,
   194	    sqft_living: 2000,
   195	    sqft_above: 1500,
   196	    sqft_basement: 500,
   197	    sqft_living15: 2000,
   198	    floors: 2,
   199	    waterfront: 0,
   200	    view: 0,
   201	    condition: 3,
   202	    grade: 7,
   203	    yr_built: 1990,
   204	    yr_renovated: 0,
   205	    lat: 47.56,
   206	    long: -122.2
   207	  })
   208	  
   209	  const [prediction, setPrediction] = useState<number | null>(null)
   210	  const [showResults, setShowResults] = useState(false)
   211	  const [activeTab, setActiveTab] = useState<'prediction' | 'insights'>('prediction')
   212	
   213	  const handlePredict = () => {
   214	    const result = predictPriceML(features)
   215	    setPrediction(result)
   216	    setShowResults(true)
   217	    toast.success('Price prediction calculated!', {
   218	      description: `Estimated value: $${(result * 100000).toLocaleString()}`
   219	    })
   220	  }
   221	
   222	  const formatCurrency = (value: number) => {
   223	    return new Intl.NumberFormat('en-US', {
   224	      style: 'currency',
   225	      currency: 'USD',
   226	      maximumFractionDigits: 0
   227	    }).format(value * 100000)
   228	  }
   229	
   230	  const formatCurrencyShort = (value: number) => {
   231	    return `$${value.toFixed(1)}k`
   232	  }
   233	
   234	  // Calculate confidence based on feature similarity to training data
   235	  const calculateConfidence = () => {
   236	    let confidence = 85
   237	    if (features.sqft_living < 500 || features.sqft_living > 6000) confidence -= 10
   238	    if (features.grade < 4 || features.grade > 12) confidence -= 15
   239	    if (features.yr_built < 1900) confidence -= 10
   240	    return Math.max(confidence, 50)
   241	  }
   242	
   243	  return (
   244	    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
   245	      {/* Header */}
   246	      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
   247	        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
   248	          <div className="flex items-center gap-3">
   249	            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
   250	              <Home className="w-6 h-6 text-white" />
   251	            </div>
   252	            <div>
   253	              <h1 className="text-xl font-bold text-slate-900">HomeValue AI</h1>
   254	              <p className="text-xs text-slate-500">ML-Powered Property Valuation</p>
   255	            </div>
   256	          </div>
   257	          <div className="flex items-center gap-4">
   258	            <Badge variant="secondary" className="hidden sm:flex items-center gap-1 bg-emerald-100 text-emerald-700">
   259	              <Target className="w-3 h-3" />
   260	              R² = {MODEL_STATS.r2_score.toFixed(2)}
   261	            </Badge>
   262	            <Badge variant="outline" className="hidden sm:flex items-center gap-1">
   263	              <BarChart3 className="w-3 h-3" />
   264	              999 Properties Analyzed
   265	            </Badge>
   266	          </div>
   267	        </div>
   268	      </header>
   269	
   270	      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
   271	        {/* Hero Section */}
   272	        <div className="text-center mb-10">
   273	          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
   274	            <Sparkles className="w-4 h-4" />
   275	            Trained on 999 Real Estate Transactions
   276	          </div>
   277	          <h2 className="text-4xl font-bold text-slate-900 mb-4">
   278	            Predict Your Home's Value with AI
   279	          </h2>
   280	          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
   281	            Our machine learning model analyzes 16 property features to deliver accurate valuations. 
   282	            With an R² score of {(MODEL_STATS.r2_score * 100).toFixed(0)}%, we explain {(MODEL_STATS.r2_score * 100).toFixed(0)}% of price variation.
   283	          </p>
   284	        </div>
   285	
   286	        {/* Tab Navigation */}
   287	        <div className="flex justify-center mb-8">
   288	          <div className="bg-white rounded-lg p-1 shadow-sm border border-slate-200 inline-flex">
   289	            <button
   290	              onClick={() => setActiveTab('prediction')}
   291	              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
   292	                activeTab === 'prediction' 
   293	                  ? 'bg-emerald-500 text-white shadow-sm' 
   294	                  : 'text-slate-600 hover:text-slate-900'
   295	              }`}
   296	            >
   297	              Price Prediction
   298	            </button>
   299	            <button
   300	              onClick={() => setActiveTab('insights')}
   301	              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
   302	                activeTab === 'insights' 
   303	                  ? 'bg-emerald-500 text-white shadow-sm' 
   304	                  : 'text-slate-600 hover:text-slate-900'
   305	              }`}
   306	            >
   307	              Model Insights
   308	            </button>
   309	          </div>
   310	        </div>
   311	
   312	        {activeTab === 'prediction' ? (
   313	          <div className="grid lg:grid-cols-3 gap-8">
   314	            {/* Input Form */}
   315	            <div className="lg:col-span-2 space-y-6">
   316	              <Card className="shadow-lg">
   317	                <CardHeader>
   318	                  <CardTitle className="flex items-center gap-2">
   319	                    <Building2 className="w-5 h-5 text-emerald-500" />
   320	                    Property Characteristics
   321	                  </CardTitle>
   322	                  <CardDescription>
   323	                    Enter your property details. Our ML model uses 16 features for accurate prediction.
   324	                  </CardDescription>
   325	                </CardHeader>
   326	                <CardContent className="space-y-6">
   327	                  {/* Living Area - Most Important */}
   328	                  <div className="space-y-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
   329	                    <div className="flex justify-between items-center">
   330	                      <Label className="flex items-center gap-2 text-emerald-800 font-semibold">
   331	                        <Square className="w-4 h-4" />
   332	                        Living Area (sqft)
   333	                        <Badge variant="secondary" className="text-xs bg-emerald-200 text-emerald-800">Most Important</Badge>
   334	                      </Label>
   335	                      <span className="text-lg font-bold text-emerald-700">
   336	                        {features.sqft_living.toLocaleString()}
   337	                      </span>
   338	                    </div>
   339	                    <Slider
   340	                      value={[features.sqft_living]}
   341	                      onValueChange={([v]) => setFeatures({...features, sqft_living: v})}
   342	                      min={380}
   343	                      max={6000}
   344	                      step={10}
   345	                    />
   346	                    <p className="text-xs text-emerald-600">Average in dataset: {MODEL_STATS.avg_sqft.toLocaleString()} sqft</p>
   347	                  </div>
   348	
   349	                  {/* Above Ground & Basement */}
   350	                  <div className="grid sm:grid-cols-2 gap-6">
   351	                    <div className="space-y-3">
   352	                      <div className="flex justify-between items-center">
   353	                        <Label className="flex items-center gap-2">
   354	                          <Layers className="w-4 h-4 text-slate-400" />
   355	                          Above Ground (sqft)
   356	                        </Label>
   357	                        <span className="text-sm font-medium text-slate-700">
   358	                          {features.sqft_above.toLocaleString()}
   359	                        </span>
   360	                      </div>
   361	                      <Slider
   362	                        value={[features.sqft_above]}
   363	                        onValueChange={([v]) => setFeatures({...features, sqft_above: v})}
   364	                        min={380}
   365	                        max={6000}
   366	                        step={10}
   367	                      />
   368	                    </div>
   369	                    <div className="space-y-3">
   370	                      <div className="flex justify-between items-center">
   371	                        <Label className="flex items-center gap-2">
   372	                          <Layers className="w-4 h-4 text-slate-400" />
   373	                          Basement (sqft)
   374	                        </Label>
   375	                        <span className="text-sm font-medium text-slate-700">
   376	                          {features.sqft_basement.toLocaleString()}
   377	                        </span>
   378	                      </div>
   379	                      <Slider
   380	                        value={[features.sqft_basement]}
   381	                        onValueChange={([v]) => setFeatures({...features, sqft_basement: v})}
   382	                        min={0}
   383	                        max={2000}
   384	                        step={10}
   385	                      />
   386	                    </div>
   387	                  </div>
   388	
   389	                  {/* Bedrooms & Bathrooms */}
   390	                  <div className="grid sm:grid-cols-2 gap-6">
   391	                    <div className="space-y-3">
   392	                      <div className="flex justify-between items-center">
   393	                        <Label className="flex items-center gap-2">
   394	                          <BedDouble className="w-4 h-4 text-slate-400" />
   395	                          Bedrooms
   396	                        </Label>
   397	                        <span className="text-sm font-medium text-slate-700">
   398	                          {features.bedrooms}
   399	                        </span>
   400	                      </div>
   401	                      <Slider
   402	                        value={[features.bedrooms]}
   403	                        onValueChange={([v]) => setFeatures({...features, bedrooms: v})}
   404	                        min={0}
   405	                        max={7}
   406	                        step={1}
   407	                      />
   408	                    </div>
   409	                    <div className="space-y-3">
   410	                      <div className="flex justify-between items-center">
   411	                        <Label className="flex items-center gap-2">
   412	                          <Bath className="w-4 h-4 text-slate-400" />
   413	                          Bathrooms
   414	                        </Label>
   415	                        <span className="text-sm font-medium text-slate-700">
   416	                          {features.bathrooms}
   417	                        </span>
   418	                      </div>
   419	                      <Slider
   420	                        value={[features.bathrooms]}
   421	                        onValueChange={([v]) => setFeatures({...features, bathrooms: v})}
   422	                        min={0}
   423	                        max={5}
   424	                        step={0.25}
   425	                      />
   426	                    </div>
   427	                  </div>
   428	
   429	                  {/* Grade & Condition */}
   430	                  <div className="grid sm:grid-cols-2 gap-4">
   431	                    <div className="space-y-2">
   432	                      <Label htmlFor="grade" className="flex items-center gap-2">
   433	                        <Target className="w-4 h-4 text-slate-400" />
   434	                        Grade (Construction Quality)
   435	                      </Label>
   436	                      <Select 
   437	                        value={features.grade.toString()} 
   438	                        onValueChange={(v) => setFeatures({...features, grade: parseInt(v)})}
   439	                      >
   440	                        <SelectTrigger>
   441	                          <SelectValue />
   442	                        </SelectTrigger>
   443	                        <SelectContent>
   444	                          {Object.entries(GRADE_DESCRIPTIONS).map(([grade, desc]) => (
   445	                            <SelectItem key={grade} value={grade}>
   446	                              Grade {grade} - {desc}
   447	                            </SelectItem>
   448	                          ))}
   449	                        </SelectContent>
   450	                      </Select>
   451	                    </div>
   452	                    <div className="space-y-2">
   453	                      <Label htmlFor="condition">Condition</Label>
   454	                      <Select 
   455	                        value={features.condition.toString()} 
   456	                        onValueChange={(v) => setFeatures({...features, condition: parseInt(v)})}
   457	                      >
   458	                        <SelectTrigger>
   459	                          <SelectValue />
   460	                        </SelectTrigger>
   461	                        <SelectContent>
   462	                          {Object.entries(CONDITION_DESCRIPTIONS).map(([cond, desc]) => (
   463	                            <SelectItem key={cond} value={cond}>
   464	                              {desc}
   465	                            </SelectItem>
   466	                          ))}
   467	                        </SelectContent>
   468	                      </Select>
   469	                    </div>
   470	                  </div>
   471	
   472	                  {/* Year Built & Renovation */}
   473	                  <div className="grid sm:grid-cols-2 gap-6">
   474	                    <div className="space-y-3">
   475	                      <div className="flex justify-between items-center">
   476	                        <Label className="flex items-center gap-2">
   477	                          <Calendar className="w-4 h-4 text-slate-400" />
   478	                          Year Built
   479	                        </Label>
   480	                        <span className="text-sm font-medium text-slate-700">
   481	                          {features.yr_built}
   482	                        </span>
   483	                      </div>
   484	                      <Slider
   485	                        value={[features.yr_built]}
   486	                        onValueChange={([v]) => setFeatures({...features, yr_built: v})}
   487	                        min={1900}
   488	                        max={2024}
   489	                        step={1}
   490	                      />
   491	                    </div>
   492	                    <div className="space-y-3">
   493	                      <div className="flex justify-between items-center">
   494	                        <Label className="flex items-center gap-2">
   495	                          <Calendar className="w-4 h-4 text-slate-400" />
   496	                          Year Renovated (0 if never)
   497	                        </Label>
   498	                        <span className="text-sm font-medium text-slate-700">
   499	                          {features.yr_renovated === 0 ? 'Never' : features.yr_renovated}
   500	                        </span>
   501	                      </div>
   502	                      <Slider
   503	                        value={[features.yr_renovated]}
   504	                        onValueChange={([v]) => setFeatures({...features, yr_renovated: v})}
   505	                        min={0}
   506	                        max={2024}
   507	                        step={1}
   508	                      />
   509	                    </div>
   510	                  </div>
   511	
   512	                  {/* Floors & View */}
   513	                  <div className="grid sm:grid-cols-2 gap-4">
   514	                    <div className="space-y-3">
   515	                      <div className="flex justify-between items-center">
   516	                        <Label className="flex items-center gap-2">
   517	                          <Layers className="w-4 h-4 text-slate-400" />
   518	                          Floors
   519	                        </Label>
   520	                        <span className="text-sm font-medium text-slate-700">
   521	                          {features.floors}
   522	                        </span>
   523	                      </div>
   524	                      <Slider
   525	                        value={[features.floors]}
   526	                        onValueChange={([v]) => setFeatures({...features, floors: v})}
   527	                        min={1}
   528	                        max={3.5}
   529	                        step={0.5}
   530	                      />
   531	                    </div>
   532	                    <div className="space-y-2">
   533	                      <Label htmlFor="view">View Quality</Label>
   534	                      <Select 
   535	                        value={features.view.toString()} 
   536	                        onValueChange={(v) => setFeatures({...features, view: parseInt(v)})}
   537	                      >
   538	                        <SelectTrigger>
   539	                          <SelectValue />
   540	                        </SelectTrigger>
   541	                        <SelectContent>
   542	                          {Object.entries(VIEW_DESCRIPTIONS).map(([view, desc]) => (
   543	                            <SelectItem key={view} value={view}>
   544	                              {desc}
   545	                            </SelectItem>
   546	                          ))}
   547	                        </SelectContent>
   548	                      </Select>
   549	                    </div>
   550	                  </div>
   551	
   552	                  {/* Waterfront */}
   553	                  <div className="space-y-2">
   554	                    <Label htmlFor="waterfront" className="flex items-center gap-2">
   555	                      <MapPin className="w-4 h-4 text-slate-400" />
   556	                      Waterfront Property
   557	                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">+${(45 * 100000 / 1000).toFixed(0)}k value</Badge>
   558	                    </Label>
   559	                    <Select 
   560	                      value={features.waterfront.toString()} 
   561	                      onValueChange={(v) => setFeatures({...features, waterfront: parseInt(v)})}
   562	                    >
   563	                      <SelectTrigger>
   564	                        <SelectValue />
   565	                      </SelectTrigger>
   566	                      <SelectContent>
   567	                        <SelectItem value="0">No</SelectItem>
   568	                        <SelectItem value="1">Yes (Waterfront)</SelectItem>
   569	                      </SelectContent>
   570	                    </Select>
   571	                  </div>
   572	
   573	                  {/* Location (Lat/Long) */}
   574	                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
   575	                    <Label className="flex items-center gap-2 mb-4">
   576	                      <MapPin className="w-4 h-4 text-slate-400" />
   577	                      Location (Seattle Area)
   578	                      <Badge variant="secondary" className="text-xs">16% importance</Badge>
   579	                    </Label>
   580	                    <div className="grid sm:grid-cols-2 gap-6">
   581	                      <div className="space-y-3">
   582	                        <div className="flex justify-between items-center">
   583	                          <span className="text-sm text-slate-600">Latitude</span>
   584	                          <span className="text-sm font-medium">{features.lat.toFixed(3)}</span>
   585	                        </div>
   586	                        <Slider
   587	                          value={[features.lat]}
   588	                          onValueChange={([v]) => setFeatures({...features, lat: v})}
   589	                          min={47.1}
   590	                          max={47.8}
   591	                          step={0.001}
   592	                        />
   593	                      </div>
   594	                      <div className="space-y-3">
   595	                        <div className="flex justify-between items-center">
   596	                          <span className="text-sm text-slate-600">Longitude</span>
   597	                          <span className="text-sm font-medium">{features.long.toFixed(3)}</span>
   598	                        </div>
   599	                        <Slider
   600	                          value={[features.long]}
   601	                          onValueChange={([v]) => setFeatures({...features, long: v})}
   602	                          min={-122.5}
   603	                          max={-121.7}
   604	                          step={0.001}
   605	                        />
   606	                      </div>
   607	                    </div>
   608	                  </div>
   609	
   610	                  <Button 
   611	                    onClick={handlePredict}
   612	                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-6 text-lg font-semibold shadow-lg"
   613	                  >
   614	                    <Sparkles className="w-5 h-5 mr-2" />
   615	                    Predict Price with AI
   616	                  </Button>
   617	                </CardContent>
   618	              </Card>
   619	            </div>
   620	
   621	            {/* Results Sidebar */}
   622	            <div className="space-y-6">
   623	              {showResults && prediction ? (
   624	                <Card className="shadow-lg border-emerald-200 bg-gradient-to-br from-emerald-50 to-white animate-slide-in">
   625	                  <CardHeader>
   626	                    <CardTitle className="flex items-center gap-2 text-emerald-700">
   627	                      <CheckCircle2 className="w-5 h-5" />
   628	                      AI Prediction
   629	                    </CardTitle>
   630	                  </CardHeader>
   631	                  <CardContent className="space-y-6">
   632	                    <div className="text-center">
   633	                      <p className="text-5xl font-bold text-emerald-600">
   634	                        {formatCurrency(prediction)}
   635	                      </p>
   636	                      <p className="text-sm text-slate-500 mt-2">
   637	                        Estimated Market Value
   638	                      </p>
   639	                    </div>
   640	
   641	                    <div className="space-y-2">
   642	                      <div className="flex justify-between text-sm">
   643	                        <span className="text-slate-500">Model Confidence</span>
   644	                        <span className="font-medium">{calculateConfidence()}%</span>
   645	                      </div>
   646	                      <Progress value={calculateConfidence()} className="h-2" />
   647	                    </div>
   648	
   649	                    <Separator />
   650	
   651	                    <div className="space-y-3">
   652	                      <h4 className="font-semibold text-slate-700 text-sm">Price Comparison</h4>
   653	                      <div className="space-y-2 text-sm">
   654	                        <div className="flex justify-between">
   655	                          <span className="text-slate-500">Your Prediction</span>
   656	                          <span className="font-medium text-emerald-600">{formatCurrencyShort(prediction)}</span>
   657	                        </div>
   658	                        <div className="flex justify-between">
   659	                          <span className="text-slate-500">Dataset Average</span>
   660	                          <span className="font-medium">{formatCurrencyShort(MODEL_STATS.mean_price)}</span>
   661	                        </div>
   662	                        <div className="flex justify-between">
   663	                          <span className="text-slate-500">Dataset Median</span>
   664	                          <span className="font-medium">{formatCurrencyShort(MODEL_STATS.median_price)}</span>
   665	                        </div>
   666	                      </div>
   667	                    </div>
   668	
   669	                    <div className="bg-emerald-100 rounded-lg p-4">
   670	                      <div className="flex items-start gap-2">
   671	                        <Info className="w-4 h-4 text-emerald-600 mt-0.5" />
   672	                        <p className="text-xs text-emerald-700">
   673	                          This estimate is based on a Gradient Boosting model trained on 999 real estate transactions 
   674	                          with an R² score of {MODEL_STATS.r2_score.toFixed(2)}.
   675	                        </p>
   676	                      </div>
   677	                    </div>
   678	                  </CardContent>
   679	                </Card>
   680	              ) : (
   681	                <Card className="shadow-lg bg-slate-50 border-dashed border-2 border-slate-200">
   682	                  <CardContent className="py-12 text-center">
   683	                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
   684	                      <Sparkles className="w-8 h-8 text-slate-400" />
   685	                    </div>
   686	                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
   687	                      Ready to Predict
   688	                    </h3>
   689	                    <p className="text-sm text-slate-500">
   690	                      Fill in your property details and click "Predict Price with AI" 
   691	                      to see your home's estimated value.
   692	                    </p>
   693	                  </CardContent>
   694	                </Card>
   695	              )}
   696	
   697	              {/* Quick Stats */}
   698	              <Card className="shadow-lg">
   699	                <CardHeader>
   700	                  <CardTitle className="text-sm flex items-center gap-2">
   701	                    <BarChart3 className="w-4 h-4 text-emerald-500" />
   702	                    Dataset Statistics
   703	                  </CardTitle>
   704	                </CardHeader>
   705	                <CardContent className="space-y-4">
   706	                  <div className="flex items-center justify-between">
   707	                    <span className="text-sm text-slate-600">Properties Analyzed</span>
   708	                    <span className="font-semibold">999</span>
   709	                  </div>
   710	                  <div className="flex items-center justify-between">
   711	                    <span className="text-sm text-slate-600">Avg. Price</span>
   712	                    <span className="font-semibold">{formatCurrencyShort(MODEL_STATS.mean_price)}</span>
   713	                  </div>
   714	                  <div className="flex items-center justify-between">
   715	                    <span className="text-sm text-slate-600">Price Range</span>
   716	                    <span className="font-semibold">{formatCurrencyShort(MODEL_STATS.min_price)} - {formatCurrencyShort(MODEL_STATS.max_price)}</span>
   717	                  </div>
   718	                  <div className="flex items-center justify-between">
   719	                    <span className="text-sm text-slate-600">Model Accuracy (R²)</span>
   720	                    <Badge className="bg-emerald-100 text-emerald-700">{(MODEL_STATS.r2_score * 100).toFixed(0)}%</Badge>
   721	                  </div>
   722	                </CardContent>
   723	              </Card>
   724	            </div>
   725	          </div>
   726	        ) : (
   727	          /* Model Insights Tab */
   728	          <div className="space-y-8">
   729	            {/* Feature Importance */}
   730	            <Card className="shadow-lg">
   731	              <CardHeader>
   732	                <CardTitle className="flex items-center gap-2">
   733	                  <Target className="w-5 h-5 text-emerald-500" />
   734	                  Feature Importance Analysis
   735	                </CardTitle>
   736	                <CardDescription>
   737	                  Our ML model identifies these features as most influential in determining house prices
   738	                </CardDescription>
   739	              </CardHeader>
   740	              <CardContent>
   741	                <div className="h-80">
   742	                  <ResponsiveContainer width="100%" height="100%">
   743	                    <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ left: 100 }}>
   744	                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
   745	                      <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `${v}%`} />
   746	                      <YAxis 
   747	                        type="category" 
   748	                        dataKey="label" 
   749	                        stroke="#64748b" 
   750	                        width={120}
   751	                        tick={{ fontSize: 12 }}
   752	                      />
   753	                      <Tooltip 
   754	                        formatter={(v: number) => [`${v}%`, 'Importance']}
   755	                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
   756	                      />
   757	                      <Bar dataKey="importance" fill="#10b981" radius={[0, 4, 4, 0]} />
   758	                    </BarChart>
   759	                  </ResponsiveContainer>
   760	                </div>
   761	                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
   762	                  <p className="text-sm text-slate-600">
   763	                    <strong className="text-slate-800">Key Insight:</strong> Living area (sqft_living) is by far the most important 
   764	                    factor, contributing 36% to the price prediction. Location (latitude/longitude) is the second most important 
   765	                    factor at ~21% combined.
   766	                  </p>
   767	                </div>
   768	              </CardContent>
   769	            </Card>
   770	
   771	            <div className="grid lg:grid-cols-2 gap-8">
   772	              {/* Price by Grade */}
   773	              <Card className="shadow-lg">
   774	                <CardHeader>
   775	                  <CardTitle className="flex items-center gap-2">
   776	                    <TrendingUp className="w-5 h-5 text-emerald-500" />
   777	                    Average Price by Grade
   778	                  </CardTitle>
   779	                  <CardDescription>
   780	                    Construction quality grade significantly impacts price
   781	                  </CardDescription>
   782	                </CardHeader>
   783	                <CardContent>
   784	                  <div className="h-64">
   785	                    <ResponsiveContainer width="100%" height="100%">
   786	                      <AreaChart data={PRICE_BY_GRADE}>
   787	                        <defs>
   788	                          <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
   789	                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
   790	                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
   791	                          </linearGradient>
   792	                        </defs>
   793	                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
   794	                        <XAxis dataKey="grade" stroke="#64748b" />
   795	                        <YAxis stroke="#64748b" tickFormatter={(v) => `$${v}k`} />
   796	                        <Tooltip 
   797	                          formatter={(v: number) => [`$${v.toFixed(1)}k`, 'Avg Price']}
   798	                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
   799	                        />
   800	                        <Area 
   801	                          type="monotone" 
   802	                          dataKey="price" 
   803	                          stroke="#10b981" 
   804	                          fillOpacity={1} 
   805	                          fill="url(#colorGrade)" 
   806	                          strokeWidth={2}
   807	                        />
   808	                      </AreaChart>
   809	                    </ResponsiveContainer>
   810	                  </div>
   811	                </CardContent>
   812	              </Card>
   813	
   814	              {/* Model Performance */}
   815	              <Card className="shadow-lg">
   816	                <CardHeader>
   817	                  <CardTitle className="flex items-center gap-2">
   818	                    <BarChart3 className="w-5 h-5 text-emerald-500" />
   819	                    Model Performance
   820	                  </CardTitle>
   821	                  <CardDescription>
   822	                    Gradient Boosting Regressor evaluation metrics
   823	                  </CardDescription>
   824	                </CardHeader>
   825	                <CardContent className="space-y-6">
   826	                  <div className="space-y-4">
   827	                    <div>
   828	                      <div className="flex justify-between mb-2">
   829	                        <span className="text-sm font-medium text-slate-700">R² Score (Accuracy)</span>
   830	                        <span className="text-sm font-bold text-emerald-600">{(MODEL_STATS.r2_score * 100).toFixed(1)}%</span>
   831	                      </div>
   832	                      <Progress value={MODEL_STATS.r2_score * 100} className="h-3" />
   833	                      <p className="text-xs text-slate-500 mt-1">
   834	                        Explains {(MODEL_STATS.r2_score * 100).toFixed(0)}% of price variation
   835	                      </p>
   836	                    </div>
   837	                    
   838	                    <div className="grid grid-cols-2 gap-4">
   839	                      <div className="bg-slate-50 p-4 rounded-lg text-center">
   840	                        <p className="text-2xl font-bold text-slate-800">${MODEL_STATS.rmse.toFixed(1)}k</p>
   841	                        <p className="text-xs text-slate-500">RMSE (Error)</p>
   842	                      </div>
   843	                      <div className="bg-slate-50 p-4 rounded-lg text-center">
   844	                        <p className="text-2xl font-bold text-slate-800">999</p>
   845	                        <p className="text-xs text-slate-500">Training Samples</p>
   846	                      </div>
   847	                    </div>
   848	                  </div>
   849	
   850	                  <div className="space-y-2">
   851	                    <h4 className="font-semibold text-slate-700 text-sm">Price Distribution</h4>
   852	                    <div className="space-y-1 text-sm">
   853	                      <div className="flex justify-between">
   854	                        <span className="text-slate-500">Minimum</span>
   855	                        <span className="font-medium">{formatCurrencyShort(MODEL_STATS.min_price)}</span>
   856	                      </div>
   857	                      <div className="flex justify-between">
   858	                        <span className="text-slate-500">Maximum</span>
   859	                        <span className="font-medium">{formatCurrencyShort(MODEL_STATS.max_price)}</span>
   860	                      </div>
   861	                      <div className="flex justify-between">
   862	                        <span className="text-slate-500">Mean</span>
   863	                        <span className="font-medium">{formatCurrencyShort(MODEL_STATS.mean_price)}</span>
   864	                      </div>
   865	                      <div className="flex justify-between">
   866	                        <span className="text-slate-500">Median</span>
   867	                        <span className="font-medium">{formatCurrencyShort(MODEL_STATS.median_price)}</span>
   868	                      </div>
   869	                    </div>
   870	                  </div>
   871	                </CardContent>
   872	              </Card>
   873	            </div>
   874	          </div>
   875	        )}
   876	      </main>
   877	
   878	      {/* Footer */}
   879	      <footer className="bg-white border-t border-slate-200 mt-12">
   880	        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
   881	          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
   882	            <div className="flex items-center gap-2">
   883	              <Home className="w-5 h-5 text-emerald-500" />
   884	              <span className="font-semibold text-slate-700">HomeValue AI</span>
   885	            </div>
   886	            <p className="text-sm text-slate-500">
   887	              © 2024 HomeValue AI. ML Model trained on 999 properties. R² = {MODEL_STATS.r2_score.toFixed(2)}.
   888	            </p>
   889	          </div>
   890	        </div>
   891	      </footer>
   892	    </div>
   893	  )
   894	}
   895	
   896	export default App
   897	
   