using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;
using System.Text;
using Newtonsoft.Json;

namespace Company.Function;

public class GetPortfolioCounter
{
    private readonly ILogger<GetPortfolioCounter> _logger;
    private readonly CosmosClient _cosmosClient; // Cosmos DB client injected via DI

    // Constructor with dependencies injected
    public GetPortfolioCounter(ILogger<GetPortfolioCounter> logger, CosmosClient cosmosClient)
    {
        _logger = logger;
        _cosmosClient = cosmosClient;
    }

    // HTTP-triggered function to get the Counter entity from Cosmos DB
    [Function("GetPortfolioCounter")]
    public async Task<HttpResponseData> Run([
        HttpTrigger(AuthorizationLevel.Function, "get", "post")
    ] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        // Get the Cosmos DB container
        var container = _cosmosClient.GetContainer("MyPortfolio", "Counter");
        try
        {
            // Attempt to read the Counter item with id and partition key "1"
            var response = await container.ReadItemAsync<Counter>("1", new PartitionKey("1"));
            var counter = response.Resource;

            // Clone counter to updateCounter and increment Count
            var updateCounter = counter; // This is a reference, not a deep clone
            updateCounter.Count += 1;

            // Persist the updated counter back to Cosmos DB
            await container.ReplaceItemAsync(updateCounter, updateCounter.Id, new PartitionKey(updateCounter.Id));

            var jsonToReturn = JsonConvert.SerializeObject(updateCounter);
            var responseMessage = req.CreateResponse(HttpStatusCode.OK);
            responseMessage.Headers.Add("Content-Type", "application/json; charset=utf-8");
            await responseMessage.WriteStringAsync(jsonToReturn);
            return responseMessage;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            // Return 404 if the item is not found
            var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
            return notFoundResponse;
        }
    }
}