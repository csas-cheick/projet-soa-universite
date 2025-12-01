using CoreWCF;
using CoreWCF.Configuration;
using CoreWCF.Description;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddServiceModelServices();
builder.Services.AddServiceModelMetadata();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

app.UseServiceModel(serviceBuilder =>
{
    serviceBuilder.AddService<BillingService.BillingService>();
    
    serviceBuilder.AddServiceEndpoint<BillingService.BillingService, BillingService.IBillingService>(
        new BasicHttpBinding(), 
        "/ws/billing"
    );

    var serviceMetadataBehavior = app.Services.GetRequiredService<ServiceMetadataBehavior>();
    serviceMetadataBehavior.HttpGetEnabled = true;
    serviceMetadataBehavior.HttpsGetEnabled = true;
});

app.MapGet("/", () => 
    "Le Service Facturation est ACTIF ! \n" +
    "Cliquez ici pour voir le WSDL : http://localhost:5000/ws/billing?wsdl"
);

app.Run();