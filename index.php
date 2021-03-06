<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>COVID Historical Daily Activity</title>

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:creator" content="@peterhuntwelch" />
    <meta name="twitter:site" content="@peterhuntwelch" />

    <meta
        property="og:image"
        content="https://www.stilldrinking.org/covid/image2.png"
        />
    <meta property="og:url" content="https://www.stilldrinking.org/covid/" />
    <meta property="og:title" content="COVID Historical Daily Activity" />
    <meta property="og:type" content="website" />
    <meta property="og:description" content="Approximation of daily covid case activity as a proportion of population at the county level over time." />

    <script src="js/dragdealer.min.js"></script>
    <script src="js/moment.min.js"></script>
    <script src="js/raphael-min.js"></script>

    <link rel="stylesheet" href="css/styles.css?cb=3">
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="map_1" class="container"></div>
    <div id="map_2" class="container"></div>
    <div id="map_3" class="container"></div>
    <div id="map_4" class="container"></div>
    <div id="map_5" class="container"></div>

    <div id="mask_map" class="alt-container"></div>

    <div id="display"></div>
    <div id="controls">
        <div id="playpause" title="Play / Pause (P)">&#9658;</div>
        <div id="bar" class="dragdealer">
            <div id="handle" class="handle" title="Drag with mouse or use left/right arrow keys"></div>
        </div>
        <div id="masktoggle" title="Show mask usage (M)">
            Mask Usage <span id="maskicon">&#8776;</span>
        </div>
        <div id="lag" title="Change trailing maps (1-5)">
            Lag
            <span>&#9679;</span><span>&#9679;</span><span>&#9679;</span><span>&#9675;</span><span>&#9675;</span>
        </div>
    </div>

    <div id="about">
        <p>
        Drag the slider for rough approximation of daily covid case activity
        as a proportion of population at the county level. Data is a bit patchy
        and the implementation is a bit wonky; this is not for research purposes,
        but gives an overall impression of distribution of activity. The suddenly
        bright red areas indicate a somewhat arbitrary cap in measuring the
        relative activity: as confusingly as possible, the top 3ish percent of
        daily cases as measured against population ramp up exponetially, so I
        capped it somewhere in the middle of that rise and it kinda sorta maybe
        represents an outbreak if the patch persists. Some sudden statewide
        spikes are reporting anamolies, often a change in how cases are recorded.
        The blank spot that never shows a case in South Dakota is the western
        half of the Pine Ridge Indian Reservation. I don't know why there's no
        data for it in the
        <a href="https://github.com/nytimes/covid-19-data" target="_angry">NYT information</a>.
        </p>
        <p>
        The "Lag" control sets the number of layers. If it's more than one,
        it will update transparent layers sequentially, creating a sort of trailing
        average effect.
        </p>
        <p>
        Mask usage is based on a single, recent data collection, so does not change
        over time.
    </div>
    <?
        $scripts = array(
            "js/data/counties.js",
            "js/data/covidbydate.js",
            "js/data/maskusage.js",
            "js/enddate.js",
            "module" => "js/engine.js"
        );

        foreach($scripts as $key => $script) {
            $hash = md5(file_get_contents($script));
            $type = $key === "module" ? " type='module'" : "";
            echo "<script$type src='$hash/$script'></script>\n\t";
        }
    ?>
</body>
</html>
