# CarbonViz model

The CarbonViz model is based on a lifecycle analysis. You can get more information on what "life cycle analysis" means into the "Mehtod & Links" page in the extension tab. You can also check there all scientific sources and references.

## Data source

Most of the impact data come from [Ecoinvent][ecoinvent] regarding electricity impact, device consumption and device factory impact.
Energy per byte for data center consumption and network transfer were estimated based on [Cisco] and the [International Energy Agency][iea].
Due to Covid in 2020 and 2021 affecting a lot network traffic (increase in video conferencing, streaming, etc.), it has been decided to currently keep the estimates done before Covid period. Those values may be review later if current switch in network traffic persists.

### Data center electricity usage per byte

Electricity usage per byte is derived from the global electricity consumption divided per global user data transferred between data center and users. *The energy consumption due to data center to data center traffic or in data center traffic is assumed evenly shared .*

Global data center energy consumption was estimated by IEA to reach **191 TWh** in 2021 (IEA, 2019).
Gloabl network traffic from data centers to users was estimated by Cisco to reach **3.1 ZB** in 2021 (Cisco, 2017).

That leads to an estimate of **6.16 e<sup>-11</sup> KWh / byte** for data center consumption.

### Core network electricity usage per byte

Electricity usage per byte is derived from the global electricity consumption divided per global user data transferred between data center and users. *The energy consumption due to data center to data center traffic or in data center traffic is assumed evenly shared .*

Global network energy consumption was estimated by IEA to reach **261 TWh** in 2021 (IEA, 2019).
Gloabl network traffic from data centers to users was estimated by Cisco to reach **3.1 ZB** in 2021 (Cisco, 2017).

That leads to an estimate of **8..39 e<sup>-11</sup> KWh / byte** for data center consumption.

## Model input parameters

Multiple parameters can be adapted in the model to estimate the impact of a specific activity.
In particular the following parameters have to be updated for a given activity:

- duration of the activity (time of plugin use)
- transfered data

In addition, the user devices can be specified:

- laptop or desktop computer
- additionnal screens
- keyboard
- mouse

It is thus possible to estimate different activities like:

- writing and sending a 10Mb e-mail on a desktop computer with 1 additionnal screen, keyboard and mouse
- 1 hour HD video streaming on a laptop computer

In addition when known, electricty mix of user device, core network and data center can be specified. They can be picked from the following mixes:

- standard low voltage CH electricity (end user device)
- certified low voltage CH electricity (end user device)
- standard medium voltage CH electricity (core network / data center)
- standard medium voltage EU electricity (core network / data center)
- standard medium voltage USA electricity (core network / data center)
- Google 2018 renewable electricity (data center)
- Google 2019 renewable electricity (data center)

Other parameters are set to standard or average values and could be adapted to a specific use case when exact values are avalaible:

- lifetime of equipment
- number hours of use

## Current implementation inside Carbonviz extension

Currently the consumption model has been implemented as a simplified version inside Carbonviz due to some technical limitations:

- location of a data center unknown. Some large dataset exist for IP address location for end user, unfortunately not for data centers, in particular in the case of worlwide providers or CDN.
- electricity mix used by data center unknown. Some providers communicate on their electricity mix but other do not communicate on it. Data center provider is not always known.

Carbonviz was also developed in Switzerland with the goal to be optimized for Switzerland usage and correspond to Switzerland electricity mix. Due to these reasons, the current CarbonViz implementation assumes:

- standard electricity mix Switzerland for devices
- standard electricity mix switzerland for core network
- standard EU mix for data centers

The following parameters are also fixed to the most standard or average values:

- laptop computer (no additional screen, no mouse, no keyboard)
- lifetime of equipments:
  - laptop: 6.5 years
  - power adapter: 6.5 years
  - Internet access equipment: 6 years
  - router: 6 years
  - number of hours of use (based on 41.5 hours/week - 4 weeks holidays): 1917.3h

Further vesion of Carbonviz are expected to include additionnal settings:

- desktop computer
- additionnal devices (screen, keyboard, mouse)
- user electricity mix (renewable/standard)
- equipment lifetime

## Technical limitations

Accuracy of consumption and impact estimated with Carbonviz may be affected by some technical limitations of browser extensions:

- limited to browser activity (thus missing native applications like video meeting, etc.)
- inaccurate data retrieved through extension API. In particular Chrome WebRequest extension API does not return exact payload size. Current implementation depends on content-length header that can be overestimated in case of video progressive streaming. Thus only completed packets are counted
- data unavailable for some streaming protocol (some web-radio, live video stream, etc.)

## Additionnal Sources

IEA, 2019: Tracking Buildings 2019
Cisco, 2017: Growth In the Cloud URL <https://www.cisco.com/c/dam/assets/sol/sp/gci/global-cloud-index-infographic.html>

[ecoinvent]: https://ecoinvent.org/
[cisco]: https://www.cisco.com
[iea]: https://www.iea.org
