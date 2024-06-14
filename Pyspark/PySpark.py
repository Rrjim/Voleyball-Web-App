

pyspark --master local[*]


df1 = spark.read.csv('file:///home/bigdata/Mens-Volleyball-PlusLiga-2008-2023.csv', header=True, inferSchema=True)


df1.show()     


from pyspark.sql.functions import regexp_replace, column



percentage_cols = ['T1_Srv_Eff', 'T1_Rec_Pos', 'T1_Rec_Perf', 'T1_Att_Kill_Perc', 'T1_Att_Eff', 'T1_Att_Sum', 'T2_Srv_Eff', 'T2_Rec_Pos', 'T2_Rec_Perf', 'T2_Att_Kill_Perc', 'T2_Att_Eff', 'T2_Att_Sum']


for col in percentage_cols:
    df1 = df1.withColumn(col, regexp_replace(col, '%', '').cast('float'))



df1.show()



from pyspark.sql.functions import upper



df1 = df1.withColumn("Team_1", upper(df1["Team_1"]))


df1 = df1.withColumn("Team_2", upper(df1["Team_2"]))


df1.show()



number_of_matches = df1.count()
print(f"Number of Matches: {number_of_matches}")


from pyspark.sql.functions import col


df1 = df1.withColumn("Total_Sets", col("T1_Score") + col("T2_Score"))

df1.show()


from pyspark.sql.functions import count



matches_per_number_of_sets = df1.groupBy("Total_Sets").agg(count("*").alias("number_of_matches"))



matches_per_number_of_sets.write.csv('file:///home/bigdata/matches_per_number_of_sets.csv', header=True)




df1.createOrReplaceTempView("matches")




query = """
SELECT Team, COUNT(*) as MatchesPlayed
FROM (
    SELECT Team_1 as Team FROM matches
    UNION ALL
    SELECT Team_2 FROM matches
) grouped
GROUP BY Team
ORDER BY MatchesPlayed DESC
"""



result_df1 = spark.sql(query)


result_df1.show()



result_df1.write.csv('file:///home/bigdata/matches_played_for_each_team.csv', header=True)




from pyspark.sql.functions import when, col



df1 = df1.withColumn("Winner", when(col("T1_Score") > col("T2_Score"), col("Team_1")).otherwise(col("Team_2")))

total_wins = df1.groupBy("Winner").count().withColumnRenamed("count", "Total_Wins")

total_wins.show()




total_wins = total_wins.withColumnRenamed("Winner", "Team")

total_wins.show()



from pyspark.sql.functions import count, sum as _sum



home_matches = df1.groupBy("Team_1").agg(count("*").alias("Home_Matches"))


away_matches = df1.groupBy("Team_2").agg(count("*").alias("Away_Matches"))



total_matches = home_matches.join(away_matches, home_matches.Team_1 == away_matches.Team_2, 'outer') \
                            .selectExpr("coalesce(Team_1, Team_2) as Team",
                                        "coalesce(Home_Matches, 0) as Matches_Played_Home",
                                        "coalesce(Away_Matches, 0) as Matches_Played_Away",
                                        "(coalesce(Home_Matches, 0) + coalesce(Away_Matches, 0)) as Matches_in_Total")

combined_df = total_matches.join(total_wins, "Team")


sorted_df = combined_df.sort(combined_df.Total_Wins.desc())


sorted_df.show()


sorted_df.write.csv('file:///home/bigdata/matches_summary_per_team.csv', header=True)



from pyspark.sql.functions import when, col


sets_won = df1.withColumn("Sets_Won", when(col("T1_Score") > col("T2_Score"), col("T1_Score")).otherwise(col("T2_Score"))) \
              .groupBy("Winner").agg(_sum("Sets_Won").alias("Total_Sets_Won"))




df2=df1
df2 = df2.withColumnRenamed("Winner", "Loser")

sets_lost = df2.withColumn("Sets_Lost", when(col("T1_Score") < col("T2_Score"), col("T2_Score")).otherwise(col("T2_Score"))) \
               .groupBy("Loser").agg(_sum("Sets_Lost").alias("Total_Sets_Lost"))


sets_won = sets_won.withColumnRenamed("Winner", "Team")
sets_lost = sets_lost.withColumnRenamed("Loser", "Team")



sorted_df = sorted_df.join(sets_won, "Team", "outer").join(sets_lost, "Team", "outer")


sorted_df.show()


sorted_df = sorted_df.sort(sorted_df.Total_Wins.desc())




from pyspark.sql.functions import when, col, sum as _sum


points_won = df1.withColumn("Points_Won", when(col("T1_Score") > col("T2_Score"), col("T1_Sum")).otherwise(col("T2_Sum"))) \
                .groupBy("Winner").agg(_sum("Points_Won").alias("Total_Points_Won"))


points_lost = df2.withColumn("Points_Lost", when(col("T1_Score") < col("T2_Score"), col("T2_Sum")).otherwise(col("T2_Sum"))) \
                 .groupBy("Loser").agg(_sum("Points_Lost").alias("Total_Points_Lost"))


points_won = points_won.withColumnRenamed("Winner", "Team")
points_lost = points_lost.withColumnRenamed("Loser", "Team")


sorted_df = sorted_df.join(points_won, "Team", "outer").join(points_lost, "Team", "outer")


sorted_df.show()

sorted_df = sorted_df.sort(sorted_df.Total_Wins.desc())

sorted_df.show()


sorted_df.write.csv('file:///home/bigdata/extended_matches_summary_per_team.csv', header=True)


from pyspark.sql import SparkSession
from pyspark.sql.functions import *


spark = SparkSession.builder \
    .appName("StructuredStreaming") \
    .getOrCreate()


schema = StructType([
    StructField("team_1", StringType(), True),
    StructField("team_2", StringType(), True),
    StructField("set_1", IntegerType(), True),
    StructField("set_2", IntegerType(), True),
    StructField("points_1", IntegerType(), True),
    StructField("points_2", IntegerType(), True)
])


input_dir = "file:///home/bigdata/inputSetScores"

streaming_df = spark.readStream \
    .schema(schema) \
    .option("header", "true") \
    .csv(input_dir)


st_stream_df = streaming_df.select(
    when(col("set_1") > col("set_2"), col("team_1")).otherwise(col("team_2")).alias("Winner"),
    when(col("set_1") < col("set_2"), col("team_1")).otherwise(col("team_2")).alias("Loser"),
    col("set_1").alias("Sets_Won"),
    col("set_2").alias("Sets_Lost"),
    col("points_1").alias("Points_Won"),
    col("points_2").alias("Points_Lost")
)


sum_df = transformed_df.groupBy("Winner").agg(
    sum("Sets_Won").alias("Total_Sets_Won"),
    sum("Sets_Lost").alias("Total_Sets_Lost"),
    sum("Points_Won").alias("Total_Points_Won"),
    sum("Points_Lost").alias("Total_Points_Lost")
)


query = summary_df.writeStream \
    .format("csv") \
    .outputMode("complete") \  
    .option("checkpointLocation", "/home/bigdata/checkpointSetScores") \
    .option("path", "file:///home/bigdata/outputSetScores") \
    .start()

query.awaitTermination()
