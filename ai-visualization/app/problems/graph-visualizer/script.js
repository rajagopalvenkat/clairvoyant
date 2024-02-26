onload = function () {
    // create a network
    const container = document.getElementById('container');
    const genNew = document.getElementById('generate-graph');
    // initialise graph options
    const options = {
        edges: {
            labelHighlightBold: true,
            font: {
                size: 20
            }
        },
        nodes: {
            font: '12px arial red',
            scaling: {
                label: true
            },
            shape: 'hexagon'
        }
    };
    // initialize your network!
    const network = new vis.Network(container);
    network.setOptions(options);

    function createData(){
        const nodes = ["Node 1", "Node 2", "Node 3", "Goal", "Start"];

        const V = Math.floor(Math.random() * nodes.length) + 3;
        let vertices = [];
        for(let i=0;i<V;i++){
            // You can add names/colors etc here.
            vertices.push({id:i, label: nodes[i-1]});
        }

        let edges = [];
        for(let i=1;i<V;i++){
            let neigh = Math.floor(Math.random()*i);
            edges.push({from: i, to: neigh, color: 'orange',label: String(Math.floor(Math.random()*70)+30)});
        }

        const data = {
            nodes: vertices,
            edges: edges
        };
        return data;
    }

    genNew.onclick = function () {
        let data = createData();
        console.log(data)
        network.setData(data);
    };

    genNew.click();
};