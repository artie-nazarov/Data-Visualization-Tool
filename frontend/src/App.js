import './App.css';
import React, { Component, useState } from 'react';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import XLSX from 'xlsx';
import { make_cols } from './MakeColumns';
import { SheetJSFT } from './types';
import {GridComponent, ColumnDirective, ColumnsDirective,
  Page, Inject, Filter, gridObserver} from '@syncfusion/ej2-react-grids';
import testData from './json.json';
 
function App() {

  // Preprocessed data state
  const [preprocessedData, setData] = useState([]);
  function updatepreprocessedDataState(e) {
    setData(eq => (preprocessedData, e));
  }

  // Equipment item state update
  const [equipmentItems, setEq] = useState([]);
  function updateEquipmentItemsState(e) {
    setEq(eq => (equipmentItems, e));
  }

  const [equipmentLabel, setEquipmentLabel] = useState([]);
  function updateEquipmentLabel(e) {
    setEquipmentLabel(eq => (equipmentLabel, e));
  }

  // Part number state update
  const [partItems, setPart] = useState([]);
  function updatePartNumberState(e) {
    setPart(eq => (partItems, e));
  }

  const [partLabels, setPartLabels] = useState([]);
  function updatePartLabels(e) {
    setPartLabels(eq => (partLabels, e));
  }

    // Code state update
    const [codeItems, setCode] = useState([]);
    function updateCodeState(e) {
      setCode(eq => (codeItems, e));
    }

    const [codeLabels, setCodeLabels] = useState([]);
    function updateCodeLabels(e) {
      setCodeLabels(eq => (codeLabels, e));
    }

    // Graph data
    var graphLabel = [];
    var pdmGraphCoordinates = [];

    // Graph states
    const [graphLabels, setLabels] = useState([]);
    function updateLabelState(e) {
      setLabels(eq => (graphLabels, e));
    }

    const [graphCoordinatesTest, setCoordinates] = useState([]);
    function updateCoordinateState(e) {
      setCoordinates(eq => (graphCoordinatesTest, e));
    }
    
    // Excel File properties
     var file = {};
     var data = [];
     var cols = [];
    
     const groupBy = require('json-groupby');

     const selectionOptions = {
      type: 'Multiple'
    };

    // TABLE FORMATING
  
    //1. Equipment list Row Selection
    let equipmentGrid = null;
    const equipmentRowSelected = () => { 
      if(equipmentGrid){
        const eqLabel = equipmentGrid.getSelectedRecords()[0]["Equipment ID"];
        updateEquipmentLabel(eqLabel);
        const keys = Object.keys(preprocessedData[eqLabel]);
        var partsList = [];
        keys.forEach(function(item) {
          partsList.push({"Part Number": item});
        })
        updatePartNumberState(partsList);
        updateCodeState([]);
      }
    }

    //2. Part Number Row selection
    let partGrid = null;
    const partRowSelected = () => {
      if(partGrid) {
        const eqLabel = equipmentLabel;
        const partLabels = partGrid.getSelectedRecords();
        updatePartLabels(partLabels);
        var keys = []
        partLabels.forEach(function(part) {
        const name = part["Part Number"];
        keys.push(...Object.keys(preprocessedData[eqLabel][name]));
        })
        keys = [...new Set(keys)];
        var codesList = [];
        keys.forEach(function(code) {
          codesList.push({"Code": code});
        })
        updateCodeState(codesList);
      }
    }

    //3. Repair Code Row selection
    let rcodeGrid = null;
    const rcodeRowSelected = () => {
      if(rcodeGrid) {
        const selectedRcodeLabel = rcodeGrid.getSelectedRecords();
        updateCodeLabels(selectedRcodeLabel);
      }
    }


    // Generate graph coordinates
    function generateCrd(x, y) {
      const coordinates = [];
      var i;
      for(i = 0; i < x.length; i++) {
        const point = {'x': x[i], 'y':y[i]};
        coordinates.push(point);
      }
      return coordinates;
    }
  
  function renderChart() {

    // Load in Data
    var xAxisData;
    var yAxisData;
    var graphCoordinates = [];
    var parts = [];
    partLabels.forEach(function(item) {
      parts.push(item["Part Number"]);
    })
    var codes = []
    codeLabels.forEach(function(item) {
      codes.push(item["Code"]);
    })

    parts.forEach(function(part) {
      xAxisData = [];
      yAxisData = [];
      Object.keys(preprocessedData[equipmentLabel][part]).forEach(function(code){
        if(codes.includes(code)) {
          preprocessedData[equipmentLabel][part][code].forEach(function(item){
            yAxisData.push(item["Code"]);
            xAxisData.push(new Date(item["Date"]));
          })
        }
      })
      graphCoordinates.push(generateCrd(xAxisData, yAxisData));
      console.log(graphCoordinates);
    })

    console.log(graphCoordinates);
    var Chart = require('chart.js');
    const ctx = document.getElementById('chart').getContext('2d');
    const myChart = new Chart(ctx, {
    type: 'scatter',
    data: {
        //labels: xAxisData,
        datasets: [{
            label: parts[0],
            data: graphCoordinates[0],
            backgroundColor: "#FF4136",
            borderColor: "#FF4136",
            fill: false,
            showLine: true,
            borderWidth: 1
        }
      //   ,
      //   {
      //     label: graphLabel[1],
      //     data: pdmGraphCoordinates[1],
      //     backgroundColor: "#0074D9",
      //     borderColor: "#0074D9",
      //     fill: false,
      //     showLine: true,
      //     borderWidth: 1
      // }
    ]
    },
    options: {
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'month'
            }
          }],
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
  }


  function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
 
 function handleChange(e) {
    const files = e.target.files;
    if (files && files[0]) file = files[0];
  };
 
 function handleFile() {
    /* Boilerplate to set up FileReader */
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
 
    reader.onload = (e) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array', bookVBA : true });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      data = XLSX.utils.sheet_to_json(ws, {raw: false});

      cols = make_cols(ws['!ref'])

        // Preprocess data
        const strData = JSON.stringify(data, null, 2)
        var jsonObject = JSON.parse(strData);
        var i;
        for(i = 0; i < jsonObject.length; i++){
          if (!("Part Number" in jsonObject[i] && "Code" in jsonObject[i] && "Date" in jsonObject[i])) {
            delete jsonObject[i];
          }
          else {
            var d = new Date(jsonObject[i]["Date"]);
            if(!jsonObject[i].Code.match(/^\d+$/)) {
              delete jsonObject[i];
            }
            else if(isNaN(d.getMonth())) {
              delete jsonObject[i];
            }
          }
        }
        const jsonRegroupedTest = groupBy(jsonObject, ['Equipment ID', 'Part Number'])
        const jsonRegrouped = groupBy(jsonObject, ['Equipment ID', 'Part Number', 'Code'])
        const equipmentComponentsList = Object.keys(jsonRegrouped);
        var eqStateObject = [];
        equipmentComponentsList.forEach(function(item) {
          eqStateObject.push({"Equipment ID": item});
        })

        //Update states
        updateEquipmentItemsState(eqStateObject);
        updatepreprocessedDataState(jsonRegrouped);
        console.log(jsonRegrouped);
        

        // Random data selection
      //   for(i = 0; i < 2; i++) {
      //     yAxisData = [];
      //     xAxisData = [];
      //   var keys = Object.keys(jsonRegroupedTest)
      //   var randIndex = Math.floor(Math.random() * keys.length)
      //   var randKey = keys[randIndex]
      //   const randomGroup = jsonRegroupedTest[randKey]
      //   var label = randKey + " => ";
      //   keys = Object.keys(randomGroup)
      //   randIndex = Math.floor(Math.random() * keys.length)
      //   randKey = keys[randIndex]
      //   const randomGroup2 = randomGroup[randKey];
      //   label += randKey;
      //   graphLabel.push(label);
        
      //   randomGroup2.forEach(function(item) {
      //     yAxisData.push(item["Code"]);
      //     xAxisData.push(item["Date"]);
      //   })
        
      //   pdmGraphCoordinates.push(generateCrd(xAxisData, yAxisData));
      // }
      // End of random data selection



     //   renderChart();

    };
    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    };
  }

 
    return (
      <div>
        <label htmlFor="file">Upload your Excel File</label>
        <br />
        <input type="file" className="form-control" id="file" accept={SheetJSFT} onChange={handleChange} />
        <br />
        <input type='submit' 
          value="Update"
          onClick={handleFile} />
        
        <div id="parent">
          <div id="EqID" style={{ marginTop: '20%', margin:'10%'}}>
            <GridComponent dataSource={equipmentItems}  
              allowPaging={true}
              pageSettings={{pageSize:10}}
              allowFiltering={true}
              rowSelected={equipmentRowSelected}
              ref={g => equipmentGrid = g}
              >
              <ColumnsDirective>
            <ColumnDirective field='Equipment ID' headerText='Equipment List' textAlign='Center'/>
            </ColumnsDirective>
            <Inject services={[Page, Filter]}/>
            </GridComponent>
          </div>

          <div id="PID" style={{ marginTop: '20%', margin:'10%'}}>
          <GridComponent dataSource={partItems}
          allowPaging={true}
          pageSettings={{pageSize:10}}
          allowFiltering={true}
          rowSelected={partRowSelected}
          rowDeselected={partRowSelected}
          ref={g => partGrid = g}
          //selectionSettings={selectionOptions}
          >
            <ColumnsDirective>
            <ColumnDirective type='checkbox' width='50'/>
          <ColumnDirective field='Part Number' headerText='Part Number' textAlign='Center'/>
          </ColumnsDirective>
          <Inject services={[Page, Filter]}/>
          </GridComponent>
          </div> 

          <div id="RC" style={{ marginTop: '20%', margin:'10%'}}>
          <GridComponent dataSource={codeItems}
          allowPaging={true}
          pageSettings={{pageSize:10}}
          allowFiltering={true}
          rowSelected={rcodeRowSelected}
          ref={g => rcodeGrid = g}
          //selectionSettings={selectionOptions}
          >
            <ColumnsDirective>
            <ColumnDirective type='checkbox' width='50'/>
          <ColumnDirective field='Code' headerText='Repair Code' textAlign='Center'/>
          </ColumnsDirective>
          <Inject services={[Page, Filter]}/>
          </GridComponent>
          </div>

          <DefaultButton onClick={renderChart}>Graph</DefaultButton>

        </div>

          <canvas id="chart"></canvas>
      </div>       

    )
  }

 
export default App;