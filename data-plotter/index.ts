import * as chartjs from 'chart.js';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import { dirname, dirname as getDirName } from 'path';
import { CanvasRenderService } from 'chartjs-node-canvas';
import { url } from 'inspector';


export interface RaplInfo {
    timestamp: string,
    command: string,
    arguments: string,
    iterations: number,
    pkg: number[],
    dram: number[],
    time: number[],
    cpu_temp_c: number[],
    fan_freq_rpm: number[],
}

export interface ProcessedRecord {
    program: string,
    records: {
        type: string,
        values: {
            argument: number,
            time: number[],
            pkg: number[],
            dram: number[],
            cpu_temp_c: number[],
            fan_freq_rpm: number[],
        }[]
    }[]
}

const homeDir = require('os').homedir()
const recordStream = fs.readFileSync(`${homeDir}/rapl.json`, 'utf8')
const records: RaplInfo[] = JSON.parse(recordStream)

function processRecords(records: RaplInfo[]): ProcessedRecord[] {
    const programs: string[] = records
        .map(x => x.command)
        .reduce((acc, curr) => {
            return acc.includes(curr) ? acc : acc.concat([curr]);
        }, [])

    return programs.map(program => {
        const processed: {
            type: string,
            values: {
                argument: number,
                pkg: number[],
                dram: number[],
                time: number[],
                cpu_temp_c: number[],
                fan_freq_rpm: number[],
            }[]
        }[] = records
            .filter(x => x.command === program)
            .map(record => {
                const args = record.arguments.split(' ')
                return {
                    type: args[1],
                    argument: parseInt(args[0]),
                    pkg: record.pkg,
                    dram: record.dram,
                    time: record.time,
                    cpu_temp_c: record.cpu_temp_c,
                    fan_freq_rpm: record.fan_freq_rpm,
                }
            })
            .reduce((acc, curr) => {
                const existingSet = acc.find(x => x.type === curr.type)
                if (existingSet) {
                    existingSet.values.push(curr)
                    return acc
                }
                else {
                    return acc.concat({
                        type: curr.type,
                        values: [{
                            argument: curr.argument,
                            time: curr.time,
                            pkg: curr.pkg,
                            dram: curr.dram,
                            cpu_temp_c: curr.cpu_temp_c,
                            fan_freq_rpm: curr.fan_freq_rpm,
                        }]
                    })
                }
            }, [])
        return { program, records: processed }
    })
}

const processed = processRecords(records)

console.log("processed records:");
processed.forEach(proc => {
    console.log(proc.program);
});

const service = new CanvasRenderService(1000, 500);

const colors = [
    '#aa5577',
    '#55aa77',
    '#5577aa',
]

const generateLineCharts = async (programs: ProcessedRecord[]) => {
    let urls: { program: string, field: string, src: string }[] = []
    const fields = ['pkg', 'dram', 'time', 'cpu_temp_c', 'fan_freq_rpm']
    fields.forEach(field => {
        programs.forEach(record => {
            const configuration: chartjs.ChartConfiguration = {
                type: 'line',
                data: {
                    datasets: record.records.map((set, index) => {
                        return {
                            data: set.values
                                .map(v => ({
                                    argument: v.argument,
                                    pkg: v.pkg.reduce((a, b) => a + b, 0) / v.pkg.length, // here we calculate averages,
                                    dram: v.dram.reduce((a, b) => a + b, 0) / v.dram.length, // here we calculate averages,
                                    time: v.time.reduce((a, b) => a + b, 0) / v.time.length, // here we calculate averages,
                                    cpu_temp_c: v.cpu_temp_c.reduce((a, b) => a + b, 0) / v.cpu_temp_c.length, // here we calculate averages,
                                    fan_freq_rpm: v.fan_freq_rpm.reduce((a, b) => a + b, 0) / v.fan_freq_rpm.length, // here we calculate averages,
                                }))
                                .map(v => Object({ x: v.argument, y: v[field] }))
                                .filter(d => d.x < 40),
                            fill: false,
                            label: set.type,
                            borderColor: colors[index],
                            lineTension: 0
                        }
                    })
                },
                options: {
                    legend: {
                        labels: {
                            fontSize: 20
                        }
                    },
                    title: {
                        text: record.program
                    },
                    showLines: true,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            }
                        }],
                        xAxes: [
                            {
                                display: true,
                                type: 'linear',
                                ticks: {
                                    maxTicksLimit: 10,
                                },
                            },
                        ],
                    }
                }
            };

            const dataUrl = service.renderToBufferSync(configuration)
            urls.push({ program: record.program, field, src: dataUrl.toString('base64') })
        })
    })
    return urls
}

console.log("generated line charts");

const generateScatterCharts = async (programs: ProcessedRecord[]) => {
    let urls: { program: string, field: string, src: string }[] = []
    const fields = ['pkg', 'dram', 'time', 'cpu_temp_c', 'fan_freq_rpm']
    fields.forEach(field => {
        programs.forEach(record => {
            const configuration: chartjs.ChartConfiguration = {
                type: 'line',
                data: {
                    datasets: record.records.map((set, index) => {
                        return {
                            data: set.values
                                .map(v => ({ x: v.argument, y: v[field] }))
                                .reduce((acc, v) => {
                                    return acc.concat(v.y.map((n: number) => ({ x: v.x, y: n })))
                                }, [])
                                .filter(d => d.x < 40),
                            fill: false,
                            label: set.type,
                            borderColor: colors[index],
                            lineTension: 0,
                            pointStyle: 'circle'
                        }
                    })
                },
                options: {
                    legend: {
                        labels: {
                            fontSize: 20
                        }
                    },
                    title: {
                        text: record.program
                    },
                    showLines: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            }
                        }],
                        xAxes: [
                            {
                                display: true,
                                type: 'linear',
                                ticks: {
                                    maxTicksLimit: 10,
                                },
                            },
                        ],
                    }
                }
            };

            const dataUrl = service.renderToBufferSync(configuration)
            urls.push({ program: record.program, field, src: dataUrl.toString('base64') })
        })
    })
    return urls
}

console.log("generated scatter charts");

const dateString = new Date().toLocaleDateString().split('/').join('-')

generateLineCharts(processed).then(async urls => {
    fs.mkdir(`${homeDir}/charts/${dateString}/averages`, { recursive: true }, () => {
        fs.writeFileSync(`${homeDir}/benchmark-charts.json`, JSON.stringify(urls))
        urls.forEach(entry => {
            fs.writeFileSync(`${homeDir}/charts/${dateString}/averages/${entry.program.split('/').join('_')}_${entry.field}.png`, entry.src, { encoding: 'base64' })
        })
        console.log("saved line charts to:", `${homeDir}/charts/${dateString}/averages/`);
    })
})


generateScatterCharts(processed).then(async srcs => {
    fs.mkdir(`${homeDir}/charts/${dateString}/all`, { recursive: true }, () => {
        fs.writeFileSync(`${homeDir}/benchmark-charts.json`, JSON.stringify(srcs))
        srcs.forEach(entry => {
            fs.writeFileSync(`${homeDir}/charts/${dateString}/all/${entry.program.split('/').join('_')}_${entry.field}.png`, entry.src, { encoding: 'base64' })
        })
        console.log("saved scatter charts to:", `${homeDir}/charts/${dateString}/all/`);
    })
})