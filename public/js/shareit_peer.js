var downfiles = {}
var cache = {}

CACHE = 0
SAVED = 1

socket.on('files.list', function(data)
{
	ui_updatefiles_peer(JSON.parse(data))

	info('files.list: '+Object.keys(JSON.parse(data)));
});

socket.on('transfer.send_chunk', function(filename, chunk, data)
{
	var file = downfiles[filename];
	cache[filename] += data;

	if(file.chunks == chunk)
		ui_filedownloaded(filename);
	else
	{
		ui_filedownloading(filename, Math.floor(chunk/file.chunks * 100));

		// Demand more data
		socket.emit('transfer.query_chunk', filename, parseInt(chunk)+1);
	}
})

function transfer_begin(file)
{
	ui_filedownloading(file.name, 0)

	var chunks = file.size/chunksize;
	if(chunks % 1 != 0)
		chunks = Math.floor(chunks) + 1;

	downfiles[file.name] = {chunk:0, chunks:chunks, ubication:CACHE}
	cache[file.name] = ''

	// Demand data from the begining of the file
	socket.emit('transfer.query_chunk', file.name, 0);
}

function get_data(file)
{
	return cache[file.name]
}